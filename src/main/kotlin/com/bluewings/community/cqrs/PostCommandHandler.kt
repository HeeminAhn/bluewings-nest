package com.bluewings.community.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.service.FileUploadService
import com.bluewings.community.api.*
import com.bluewings.community.domain.Comment
import com.bluewings.community.domain.CommentImage
import com.bluewings.community.domain.Post
import com.bluewings.community.domain.PostImage
import com.bluewings.community.domain.PostLike
import com.bluewings.community.domain.PostView
import com.bluewings.community.dto.response.CommentResponse
import com.bluewings.community.dto.response.LikeResponse
import com.bluewings.community.dto.response.PostResponse
import com.bluewings.community.repository.CategoryRepository
import com.bluewings.community.repository.CommentImageRepository
import com.bluewings.community.repository.CommentRepository
import com.bluewings.community.repository.PostImageRepository
import com.bluewings.community.repository.PostLikeRepository
import com.bluewings.community.repository.PostRepository
import com.bluewings.community.repository.PostViewRepository
import com.bluewings.member.repository.MemberRepository
import com.bluewings.shared.kernel.EventBus
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class PostCommandHandler(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val postLikeRepository: PostLikeRepository,
    private val postImageRepository: PostImageRepository,
    private val postViewRepository: PostViewRepository,
    private val commentImageRepository: CommentImageRepository,
    private val categoryRepository: CategoryRepository,
    private val memberRepository: MemberRepository,
    private val fileUploadService: FileUploadService,
    private val eventBus: EventBus
) {
    companion object {
        private const val VIEW_COUNT_INTERVAL_MS = 3000L // 3초 내 중복 조회 방지
    }

    @Transactional
    fun handle(command: CreatePostCommand): PostResponse {
        val member = memberRepository.findById(command.memberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val category = command.categoryId?.let { categoryId ->
            categoryRepository.findById(categoryId)
                ?: throw BusinessException(ErrorCode.CATEGORY_NOT_FOUND)
        }

        val post = Post(
            member = member,
            title = command.title,
            content = command.content
        )
        post.category = category
        postRepository.persist(post)

        // 이미지 저장
        command.images.forEachIndexed { index, imageData ->
            val postImage = PostImage(
                post = post,
                fileName = imageData.fileName,
                originalName = imageData.originalName,
                filePath = imageData.filePath,
                fileSize = imageData.fileSize,
                contentType = imageData.contentType,
                displayOrder = index
            )
            postImageRepository.persist(postImage)
            post.images.add(postImage)
        }

        // 게시글 작성 이벤트 발행 -> Member 모듈에서 활동 통계 업데이트
        eventBus.publish(PostCreatedEvent(
            postId = post.id,
            authorId = command.memberId,
            title = post.title,
            categoryId = category?.id ?: 0L
        ))

        return PostResponse.from(post)
    }

    @Transactional
    fun handle(command: UpdatePostCommand): PostResponse {
        val post = postRepository.findById(command.postId)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        if (post.member.id != command.memberId) {
            throw BusinessException(ErrorCode.FORBIDDEN)
        }

        val category = command.categoryId?.let { categoryId ->
            categoryRepository.findById(categoryId)
                ?: throw BusinessException(ErrorCode.CATEGORY_NOT_FOUND)
        }

        post.update(command.title, command.content)
        post.category = category

        // 기존 이미지 삭제 (파일 시스템 + DB)
        post.images.forEach { image ->
            fileUploadService.deleteFile(image.filePath)
        }
        postImageRepository.deleteByPostId(command.postId)
        post.images.clear()

        // 새 이미지 저장
        command.images.forEachIndexed { index, imageData ->
            val postImage = PostImage(
                post = post,
                fileName = imageData.fileName,
                originalName = imageData.originalName,
                filePath = imageData.filePath,
                fileSize = imageData.fileSize,
                contentType = imageData.contentType,
                displayOrder = index
            )
            postImageRepository.persist(postImage)
            post.images.add(postImage)
        }

        return PostResponse.from(post)
    }

    @Transactional
    fun handle(command: DeletePostCommand) {
        val post = postRepository.findById(command.postId)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        if (post.member.id != command.memberId) {
            throw BusinessException(ErrorCode.FORBIDDEN)
        }

        // 이미지 파일 삭제
        post.images.forEach { image ->
            fileUploadService.deleteFile(image.filePath)
        }

        // 관련 이미지, 댓글, 좋아요 삭제
        postImageRepository.deleteByPostId(command.postId)
        commentRepository.deleteByPostId(command.postId)
        postLikeRepository.deleteByPostId(command.postId)

        postRepository.delete(post)

        // 게시글 삭제 이벤트 발행 -> Member 모듈에서 활동 통계 업데이트
        eventBus.publish(PostDeletedEvent(
            postId = command.postId,
            authorId = command.memberId
        ))
    }

    @Transactional
    fun handle(command: IncrementViewCountCommand) {
        val post = postRepository.findById(command.postId)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        // 중복 조회 체크
        // - 로그인 사용자: 이전에 조회한 적 있으면 무시 (영구)
        // - 비로그인 사용자: 동일 IP로 일정 시간 내 조회했으면 무시
        val isDuplicate = if (command.memberId != null) {
            postViewRepository.existsByPostIdAndMemberId(command.postId, command.memberId)
        } else if (command.ipAddress != null) {
            val viewWindowStart = java.time.LocalDateTime.now().minusSeconds(VIEW_COUNT_INTERVAL_MS / 1000)
            postViewRepository.existsByPostIdAndIpAddressAfter(command.postId, command.ipAddress, viewWindowStart)
        } else {
            false
        }

        if (isDuplicate) {
            return
        }

        // 조회 이력 저장
        val member = command.memberId?.let { memberRepository.findById(it) }
        val postView = PostView(
            post = post,
            member = member,
            ipAddress = command.ipAddress
        )
        postViewRepository.persist(postView)

        // 원자적 카운트 증가
        postRepository.incrementViewCount(command.postId)
    }

    @Transactional
    fun handle(command: ToggleLikeCommand): LikeResponse {
        val post = postRepository.findById(command.postId)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        val member = memberRepository.findById(command.memberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val existingLike = postLikeRepository.findByPostIdAndMemberId(command.postId, command.memberId)

        val isLiked: Boolean
        val likeCount: Int

        if (existingLike != null) {
            // 좋아요 취소
            postLikeRepository.delete(existingLike)
            postRepository.decrementLikeCount(command.postId)
            isLiked = false
        } else {
            // 좋아요 추가
            val postLike = PostLike(post = post, member = member)
            postLikeRepository.persist(postLike)
            postRepository.incrementLikeCount(command.postId)
            isLiked = true
        }

        // 최신 카운트 조회
        val updatedPost = postRepository.findById(command.postId)!!
        likeCount = updatedPost.likeCount

        // 좋아요 토글 이벤트 발행 -> Member 모듈에서 활동 통계 업데이트
        eventBus.publish(PostLikeToggledEvent(
            postId = command.postId,
            memberId = command.memberId,
            isLiked = isLiked,
            totalLikeCount = likeCount
        ))

        return LikeResponse(
            postId = command.postId,
            isLiked = isLiked,
            likeCount = likeCount
        )
    }

    @Transactional
    fun handle(command: CreateCommentCommand): CommentResponse {
        val post = postRepository.findById(command.postId)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        val member = memberRepository.findById(command.memberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        // 대댓글인 경우 부모 댓글 조회
        val parentComment = command.parentId?.let { parentId ->
            commentRepository.findById(parentId)
                ?: throw BusinessException(ErrorCode.COMMENT_NOT_FOUND, "부모 댓글을 찾을 수 없습니다")
        }

        val comment = Comment(
            post = post,
            member = member,
            content = command.content,
            parent = parentComment
        )
        commentRepository.persist(comment)

        // 이미지 저장
        command.images.forEachIndexed { index, imageData ->
            val commentImage = CommentImage(
                comment = comment,
                fileName = imageData.fileName,
                originalName = imageData.originalName,
                filePath = imageData.filePath,
                fileSize = imageData.fileSize,
                contentType = imageData.contentType,
                displayOrder = index
            )
            commentImageRepository.persist(commentImage)
            comment.images.add(commentImage)
        }

        // 원자적 카운트 증가
        postRepository.incrementCommentCount(command.postId)

        // 댓글 작성 이벤트 발행 -> Member 모듈에서 활동 통계 업데이트
        eventBus.publish(CommentCreatedEvent(
            commentId = comment.id,
            postId = command.postId,
            authorId = command.memberId,
            content = comment.content
        ))

        return CommentResponse.from(comment)
    }

    @Transactional
    fun handle(command: UpdateCommentCommand): CommentResponse {
        val comment = commentRepository.findById(command.commentId)
            ?: throw BusinessException(ErrorCode.COMMENT_NOT_FOUND)

        if (comment.member.id != command.memberId) {
            throw BusinessException(ErrorCode.FORBIDDEN)
        }

        comment.update(command.content)

        // 기존 이미지 삭제 (파일 시스템 + DB)
        comment.images.forEach { image ->
            fileUploadService.deleteFile(image.filePath)
        }
        commentImageRepository.deleteByCommentId(command.commentId)
        comment.images.clear()

        // 새 이미지 저장
        command.images.forEachIndexed { index, imageData ->
            val commentImage = CommentImage(
                comment = comment,
                fileName = imageData.fileName,
                originalName = imageData.originalName,
                filePath = imageData.filePath,
                fileSize = imageData.fileSize,
                contentType = imageData.contentType,
                displayOrder = index
            )
            commentImageRepository.persist(commentImage)
            comment.images.add(commentImage)
        }

        return CommentResponse.from(comment)
    }

    @Transactional
    fun handle(command: DeleteCommentCommand) {
        val comment = commentRepository.findById(command.commentId)
            ?: throw BusinessException(ErrorCode.COMMENT_NOT_FOUND)

        if (comment.member.id != command.memberId) {
            throw BusinessException(ErrorCode.FORBIDDEN)
        }

        // 이미지 파일 삭제
        comment.images.forEach { image ->
            fileUploadService.deleteFile(image.filePath)
        }
        commentImageRepository.deleteByCommentId(command.commentId)

        // 원자적 카운트 감소
        val postId = comment.post.id
        postRepository.decrementCommentCount(postId)

        commentRepository.delete(comment)

        // 댓글 삭제 이벤트 발행 -> Member 모듈에서 활동 통계 업데이트
        eventBus.publish(CommentDeletedEvent(
            commentId = command.commentId,
            postId = postId,
            authorId = command.memberId
        ))
    }
}
