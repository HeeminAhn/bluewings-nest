package com.bluewings.chat.resource

import com.bluewings.chat.cqrs.ChatQueryHandler
import com.bluewings.chat.cqrs.GetChatHistoryQuery
import com.bluewings.chat.dto.response.ChatHistoryResponse
import com.bluewings.common.response.ApiResponse
import io.quarkus.security.Authenticated
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement

@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@SecurityRequirement(name = "bearerAuth")
class ChatResource(
    private val queryHandler: ChatQueryHandler
) {
    companion object {
        private const val MAX_HISTORY_LIMIT = 100
    }

    @GET
    @Path("/history")
    fun getHistory(
        @QueryParam("beforeId") beforeId: Long?,
        @QueryParam("limit") @DefaultValue("100") limit: Int
    ): ApiResponse<ChatHistoryResponse> {
        val safeLimit = limit.coerceIn(1, MAX_HISTORY_LIMIT)
        val response = queryHandler.handle(GetChatHistoryQuery(beforeId = beforeId, limit = safeLimit))
        return ApiResponse.success(response)
    }
}
