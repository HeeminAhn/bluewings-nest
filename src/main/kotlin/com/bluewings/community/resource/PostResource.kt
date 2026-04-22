package com.bluewings.community.resource

import com.bluewings.common.pagination.PageParams
import com.bluewings.common.response.ApiResponse
import com.bluewings.community.cqrs.*
import com.bluewings.community.dto.request.CreatePostRequest
import com.bluewings.community.dto.request.ImageRequest
import com.bluewings.community.dto.request.UpdatePostRequest
import com.bluewings.community.dto.response.LikeResponse
import com.bluewings.community.dto.response.PagedPostResponse
import com.bluewings.community.dto.response.PostListResponse
import com.bluewings.community.dto.response.PostResponse
import io.vertx.ext.web.RoutingContext
import jakarta.annotation.security.PermitAll
import jakarta.annotation.security.RolesAllowed
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/posts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Post", description = "게시글 API")
class PostResource(
    private val commandHandler: PostCommandHandler,
    private val queryHandler: PostQueryHandler,
    private val jwt: JsonWebToken,
    private val routingContext: RoutingContext
) {
    private fun getCurrentMemberId(): Long {
        val claim = jwt.getClaim<Any>("memberId")
        return when (claim) {
            is Long -> claim
            is Number -> claim.toLong()
            is String -> claim.toLong()
            else -> jwt.subject.toLong()
        }
    }

    private fun getCurrentMemberIdOrNull(): Long? {
        return try {
            getCurrentMemberId()
        } catch (e: Exception) {
            null
        }
    }

    private fun getClientIpAddress(): String? {
        val request = routingContext.request()
        // Cloudflare Tunnel 환경 (CF-Connecting-IP)
        val cfIp = request.getHeader("CF-Connecting-IP")
        if (!cfIp.isNullOrBlank()) {
            return cfIp
        }
        // X-Forwarded-For 헤더 확인 (프록시/로드밸런서 뒤에 있는 경우)
        val forwardedFor = request.getHeader("X-Forwarded-For")
        if (!forwardedFor.isNullOrBlank()) {
            return forwardedFor.split(",").first().trim()
        }
        // X-Real-IP 헤더 확인
        val realIp = request.getHeader("X-Real-IP")
        if (!realIp.isNullOrBlank()) {
            return realIp
        }
        // 직접 연결된 클라이언트 IP
        return request.remoteAddress()?.host()
    }

    @GET
    @PermitAll
    @Operation(summary = "게시글 목록 조회", description = "페이지네이션된 게시글 목록을 조회합니다")
    fun getPosts(
        @Valid @BeanParam pageParams: PageParams,
        @QueryParam("categoryId") categoryId: Long?
    ): ApiResponse<PagedPostResponse> {
        val query = GetPostsPagedQuery(categoryId = categoryId, page = pageParams.page, size = pageParams.size)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @GET
    @Path("/search")
    @PermitAll
    @Operation(summary = "게시글 검색", description = "제목으로 게시글을 검색합니다")
    fun searchPosts(
        @QueryParam("keyword") keyword: String,
        @Valid @BeanParam pageParams: PageParams
    ): ApiResponse<PagedPostResponse> {
        val query = SearchPostsQuery(keyword = keyword, page = pageParams.page, size = pageParams.size)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @GET
    @Path("/popular")
    @PermitAll
    @Operation(summary = "인기글 조회", description = "일간/주간/월간 인기글을 조회합니다")
    fun getPopularPosts(
        @QueryParam("period") @DefaultValue("DAILY") period: String,
        @QueryParam("limit") @DefaultValue("5") limit: Int
    ): ApiResponse<List<PostListResponse>> {
        val popularPeriod = try {
            PopularPeriod.valueOf(period.uppercase())
        } catch (e: IllegalArgumentException) {
            PopularPeriod.DAILY
        }
        val query = GetPopularPostsQuery(period = popularPeriod, limit = limit)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "게시글 상세 조회", description = "게시글 상세 정보를 조회하고 조회수를 증가시킵니다")
    fun getPost(
        @PathParam("id") id: Long,
        @QueryParam("skipViewCount") @DefaultValue("false") skipViewCount: Boolean
    ): ApiResponse<PostResponse> {
        // 조회수 증가 (이력 저장 포함) - skipViewCount가 true면 건너뜀
        if (!skipViewCount) {
            val viewCommand = IncrementViewCountCommand(
                postId = id,
                memberId = getCurrentMemberIdOrNull(),
                ipAddress = getClientIpAddress()
            )
            commandHandler.handle(viewCommand)
        }

        val query = GetPostByIdQuery(postId = id, viewerId = getCurrentMemberIdOrNull())
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @GET
    @Path("/member/{memberId}")
    @PermitAll
    @Operation(summary = "회원별 게시글 조회", description = "특정 회원이 작성한 게시글 목록을 조회합니다")
    fun getPostsByMember(
        @PathParam("memberId") memberId: Long,
        @Valid @BeanParam pageParams: PageParams
    ): ApiResponse<PagedPostResponse> {
        val query = GetPostsByMemberQuery(memberId = memberId, page = pageParams.page, size = pageParams.size)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @POST
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "게시글 작성", description = "새로운 게시글을 작성합니다")
    fun createPost(@Valid request: CreatePostRequest): ApiResponse<PostResponse> {
        val command = CreatePostCommand(
            memberId = getCurrentMemberId(),
            title = request.title,
            content = request.content,
            categoryId = request.categoryId,
            images = request.images.map { it.toImageData() }
        )
        val result = commandHandler.handle(command)
        return ApiResponse.success(result)
    }

    private fun ImageRequest.toImageData() = ImageData(
        fileName = fileName,
        originalName = originalName,
        filePath = filePath,
        fileSize = fileSize,
        contentType = contentType
    )

    @PUT
    @Path("/{id}")
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "게시글 수정", description = "자신의 게시글을 수정합니다")
    fun updatePost(
        @PathParam("id") id: Long,
        @Valid request: UpdatePostRequest
    ): ApiResponse<PostResponse> {
        val command = UpdatePostCommand(
            postId = id,
            memberId = getCurrentMemberId(),
            title = request.title,
            content = request.content,
            categoryId = request.categoryId,
            images = request.images.map { it.toImageData() }
        )
        val result = commandHandler.handle(command)
        return ApiResponse.success(result)
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "게시글 삭제", description = "자신의 게시글을 삭제합니다")
    fun deletePost(@PathParam("id") id: Long): ApiResponse<Unit> {
        val command = DeletePostCommand(
            postId = id,
            memberId = getCurrentMemberId()
        )
        commandHandler.handle(command)
        return ApiResponse.success(Unit)
    }

    @POST
    @Path("/{id}/like")
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "좋아요 토글", description = "게시글 좋아요를 토글합니다 (좋아요/취소)")
    fun toggleLike(@PathParam("id") id: Long): ApiResponse<LikeResponse> {
        val command = ToggleLikeCommand(
            postId = id,
            memberId = getCurrentMemberId()
        )
        val result = commandHandler.handle(command)
        return ApiResponse.success(result)
    }
}
