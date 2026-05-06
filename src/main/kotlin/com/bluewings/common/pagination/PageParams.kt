package com.bluewings.common.pagination

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.ws.rs.DefaultValue
import jakarta.ws.rs.QueryParam
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter

/**
 * 페이지네이션 공통 파라미터.
 *
 * 리소스 메서드 인자에 `@BeanParam PageParams`로 받으면 `?page=0&size=20` 쿼리 파라미터가
 * 자동으로 매핑된다. Jakarta REST 표준(`@BeanParam`)을 사용하므로 SmallRye OpenAPI가
 * Swagger UI에 `page`, `size`를 평면화해 문서화한다.
 *
 * 검증:
 * - `page >= 0`
 * - `1 <= size <= 100` (비정상적으로 큰 페이지 크기 방어)
 *
 * 메서드 인자에 `@Valid`를 붙여야 검증이 작동한다.
 */
class PageParams {
    @QueryParam("page")
    @DefaultValue("0")
    @Min(value = 0, message = "page는 0 이상이어야 합니다")
    @Parameter(description = "0부터 시작하는 페이지 번호", example = "0")
    var page: Int = 0

    @QueryParam("size")
    @DefaultValue("20")
    @Min(value = 1, message = "size는 1 이상이어야 합니다")
    @Max(value = 100, message = "size는 100 이하여야 합니다")
    @Parameter(description = "페이지 크기 (1-100)", example = "20")
    var size: Int = 20
}
