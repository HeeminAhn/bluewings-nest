package com.bluewings.member.service

import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalDate
import java.time.Month

@ApplicationScoped
class FortuneCookieService {

    fun getRandomFortuneCookie(): FortuneCookie {
        val today = LocalDate.now()
        val seasonalMessages = getSeasonalMessages(today.month)
        val allMessages = baseMessages + seasonalMessages

        // 날짜 기반 시드로 같은 날에는 같은 메시지 (사용자별로 다르게 하려면 memberId 추가)
        val index = (today.toEpochDay() % allMessages.size).toInt()
        return allMessages[Math.abs(index)]
    }

    fun getRandomFortuneCookieForMember(memberId: Long): FortuneCookie {
        val today = LocalDate.now()
        val seasonalMessages = getSeasonalMessages(today.month)
        val allMessages = baseMessages + seasonalMessages

        // 날짜 + 회원ID 기반으로 회원마다 다른 메시지
        val seed = today.toEpochDay() + memberId
        val index = (seed % allMessages.size).toInt()
        return allMessages[Math.abs(index)]
    }

    private fun getSeasonalMessages(month: Month): List<FortuneCookie> {
        return when (month) {
            Month.MARCH, Month.APRIL, Month.MAY -> springMessages
            Month.JUNE, Month.JULY, Month.AUGUST -> summerMessages
            Month.SEPTEMBER, Month.OCTOBER, Month.NOVEMBER -> autumnMessages
            Month.DECEMBER, Month.JANUARY, Month.FEBRUARY -> winterMessages
        }
    }

    companion object {
        // 일반 응원 메시지 (30개)
        private val cheerMessages = listOf(
            FortuneCookie("빅버드의 날갯짓처럼, 오늘도 힘차게 날아올라!", "응원"),
            FortuneCookie("파란 피가 흐르는 당신, 오늘도 승리의 주인공!", "응원"),
            FortuneCookie("수원의 자부심을 가슴에 품고 오늘 하루도 파이팅!", "응원"),
            FortuneCookie("블루윙즈와 함께라면 어떤 역경도 이겨낼 수 있어요!", "응원"),
            FortuneCookie("당신의 응원이 선수들에게 큰 힘이 됩니다!", "응원"),
            FortuneCookie("오늘도 블루윙즈처럼 최선을 다하는 하루 되세요!", "응원"),
            FortuneCookie("푸른 날개로 하늘을 향해! 당신의 꿈도 이루어질 거예요!", "응원"),
            FortuneCookie("12번째 선수인 당신이 있어 블루윙즈는 강합니다!", "응원"),
            FortuneCookie("빅버드처럼 높이 날아 세상을 내려다보세요!", "응원"),
            FortuneCookie("수원 삼성의 영광스러운 역사가 당신과 함께합니다!", "응원"),
            FortuneCookie("오늘 당신에게 기분 좋은 일이 생길 거예요!", "응원"),
            FortuneCookie("블루윙즈 팬이라면 포기란 없다! 끝까지 화이팅!", "응원"),
            FortuneCookie("당신의 열정이 경기장을 가득 채웁니다!", "응원"),
            FortuneCookie("함께하는 응원, 함께하는 승리!", "응원"),
            FortuneCookie("파란 물결이 되어 승리를 향해 나아가요!", "응원"),
            FortuneCookie("블루윙즈의 정신으로 오늘도 도전하세요!", "응원"),
            FortuneCookie("당신은 최고의 서포터입니다!", "응원"),
            FortuneCookie("수원의 밤하늘처럼 빛나는 하루 되세요!", "응원"),
            FortuneCookie("응원의 함성이 골로 이어집니다!", "응원"),
            FortuneCookie("블루윙즈와 함께 영원히! 오늘도 좋은 하루!", "응원"),
            FortuneCookie("팬의 마음은 선수에게 전해집니다. 오늘도 응원해요!", "응원"),
            FortuneCookie("빅버드의 심장으로 뛰는 당신, 멋져요!", "응원"),
            FortuneCookie("오늘의 응원이 내일의 승리를 만듭니다!", "응원"),
            FortuneCookie("블루윙즈 팬으로서의 자부심을 느끼세요!", "응원"),
            FortuneCookie("당신의 응원 한 마디가 선수들의 원동력입니다!", "응원"),
            FortuneCookie("수원을 사랑하는 마음, 빅버드가 알고 있어요!", "응원"),
            FortuneCookie("오늘도 파란 가슴으로 세상을 이겨내세요!", "응원"),
            FortuneCookie("블루윙즈처럼 강인하게, 오늘 하루도 힘내세요!", "응원"),
            FortuneCookie("열두 번째 선수의 힘을 보여주세요!", "응원"),
            FortuneCookie("수원의 영웅은 바로 당신입니다!", "응원")
        )

        // 경기 관련 메시지 (20개)
        private val matchMessages = listOf(
            FortuneCookie("승리는 준비된 자에게 온다. 오늘 경기 기대하세요!", "경기"),
            FortuneCookie("골 넣는 꿈을 꾸셨다면, 오늘 경기에서 이루어질지도!", "경기"),
            FortuneCookie("빅버드의 골 세리머니를 볼 수 있는 날이 다가옵니다!", "경기"),
            FortuneCookie("경기장에서의 함성이 승리를 부릅니다!", "경기"),
            FortuneCookie("역전승의 짜릿함을 곧 느낄 수 있을 거예요!", "경기"),
            FortuneCookie("클린시트의 기쁨이 당신을 기다립니다!", "경기"),
            FortuneCookie("결승골의 주인공은 당신이 응원하는 선수!", "경기"),
            FortuneCookie("멀티골의 환호성이 경기장을 가득 채울 거예요!", "경기"),
            FortuneCookie("수비진의 완벽한 경기를 기대해보세요!", "경기"),
            FortuneCookie("미드필더의 환상적인 패스가 골로 이어집니다!", "경기"),
            FortuneCookie("프리킥 골의 짜릿함을 곧 만나실 거예요!", "경기"),
            FortuneCookie("코너킥에서 터지는 헤딩골을 기대하세요!", "경기"),
            FortuneCookie("페널티킥 성공의 기쁨이 찾아올 거예요!", "경기"),
            FortuneCookie("종료 직전 극적인 골이 예감됩니다!", "경기"),
            FortuneCookie("완승의 기쁨을 곧 느끼실 수 있을 거예요!", "경기"),
            FortuneCookie("선제골로 시작하는 행복한 경기가 될 거예요!", "경기"),
            FortuneCookie("연승 행진이 계속될 것 같은 예감!", "경기"),
            FortuneCookie("골키퍼의 슈퍼세이브가 팀을 구할 거예요!", "경기"),
            FortuneCookie("교체 선수의 활약이 빛날 경기가 다가옵니다!", "경기"),
            FortuneCookie("홈경기의 승리가 당신을 기다립니다!", "경기")
        )

        // 명언/격언 메시지 (20개)
        private val wisdomMessages = listOf(
            FortuneCookie("포기하지 않으면 반드시 골이 들어간다!", "명언"),
            FortuneCookie("팀워크가 꿈을 이룬다. 함께라서 강하다!", "명언"),
            FortuneCookie("오늘의 땀이 내일의 승리를 만든다!", "명언"),
            FortuneCookie("실패는 성공의 어머니, 패배는 승리의 발판!", "명언"),
            FortuneCookie("작은 노력이 모여 큰 승리가 된다!", "명언"),
            FortuneCookie("끝까지 뛰는 자가 승리한다!", "명언"),
            FortuneCookie("믿음이 있는 곳에 승리가 있다!", "명언"),
            FortuneCookie("한 골 한 골이 역사를 만든다!", "명언"),
            FortuneCookie("오늘 흘린 땀은 내일의 영광이 된다!", "명언"),
            FortuneCookie("함께 뛰면 두려울 것이 없다!", "명언"),
            FortuneCookie("최선을 다하면 후회는 없다!", "명언"),
            FortuneCookie("승리보다 값진 것은 최선을 다한 경기!", "명언"),
            FortuneCookie("90분이 끝날 때까지 경기는 끝난 게 아니다!", "명언"),
            FortuneCookie("위기는 곧 기회다. 역전의 찬스를 잡아라!", "명언"),
            FortuneCookie("작은 승리가 모여 챔피언이 된다!", "명언"),
            FortuneCookie("열정이 있는 곳에 불가능은 없다!", "명언"),
            FortuneCookie("오늘의 도전이 내일의 전설이 된다!", "명언"),
            FortuneCookie("함께하는 응원이 불가능을 가능으로!", "명언"),
            FortuneCookie("승리는 노력하는 자의 것이다!", "명언"),
            FortuneCookie("꿈을 향해 달려라, 골대를 향해 달려라!", "명언"),
            FortuneCookie("나를 죽이지못하는 고통은 나를 더욱 강하게 만든다.", "명언")
        )

        // 유머/재치 메시지 (15개)
        private val funnyMessages = listOf(
            FortuneCookie("오늘 점심은 삼겹살이 당길 거예요. 삼(3)점 먹으니까!", "유머"),
            FortuneCookie("빅버드가 당신에게 윙크를 보냅니다! 😉", "유머"),
            FortuneCookie("오늘 로또 사면... 음, 그냥 블루윙즈 응원하세요!", "유머"),
            FortuneCookie("VAR 판독 결과: 당신은 오늘 행운아입니다!", "유머"),
            FortuneCookie("옐로카드 없는 깨끗한 하루 되세요!", "유머"),
            FortuneCookie("오프사이드 조심! 너무 앞서가지 마세요~", "유머"),
            FortuneCookie("레드카드 받지 말고 평화로운 하루!", "유머"),
            FortuneCookie("오늘의 MVP는 바로 당신!", "유머"),
            FortuneCookie("해트트릭처럼 세 번의 행운이 찾아올 거예요!", "유머"),
            FortuneCookie("주심이 말합니다: 오늘 하루 플레이 온!", "유머"),
            FortuneCookie("골키퍼처럼 오늘 모든 불운을 막아내세요!", "유머"),
            FortuneCookie("인저리 타임에 기적이 일어날 거예요!", "유머"),
            FortuneCookie("당신의 하루에 어시스트 하나 추가요!", "유머"),
            FortuneCookie("오늘은 자책골 없는 완벽한 하루!", "유머"),
            FortuneCookie("승부차기까지 안 가도 될 만큼 좋은 하루예요!", "유머")
        )

        // 봄 시즌 메시지 (10개)
        private val springMessages = listOf(
            FortuneCookie("봄바람처럼 상쾌한 승리가 찾아올 거예요!", "봄"),
            FortuneCookie("새 시즌의 시작처럼 새로운 희망이 피어납니다!", "봄"),
            FortuneCookie("벚꽃처럼 아름다운 골이 터질 거예요!", "봄"),
            FortuneCookie("봄의 기운처럼 팀에도 활력이 넘칩니다!", "봄"),
            FortuneCookie("개막전의 설렘처럼 두근거리는 하루!", "봄"),
            FortuneCookie("새싹처럼 자라나는 신인 선수들을 응원해요!", "봄"),
            FortuneCookie("봄비가 내리면 잔디가 푸르러지듯 승리가!", "봄"),
            FortuneCookie("따스한 봄 햇살처럼 마음 따뜻한 하루!", "봄"),
            FortuneCookie("봄의 시작과 함께 승리의 행진도 시작!", "봄"),
            FortuneCookie("꽃피는 봄에 우승의 꿈도 활짝!", "봄")
        )

        // 여름 시즌 메시지 (10개)
        private val summerMessages = listOf(
            FortuneCookie("뜨거운 여름처럼 열정적인 경기가 펼쳐집니다!", "여름"),
            FortuneCookie("여름밤 야간경기의 짜릿함을 기대하세요!", "여름"),
            FortuneCookie("무더위를 날릴 시원한 골이 터질 거예요!", "여름"),
            FortuneCookie("여름 휴가보다 짜릿한 승리가 기다려요!", "여름"),
            FortuneCookie("폭염주의보! 경기장은 더 뜨겁습니다!", "여름"),
            FortuneCookie("시원한 맥주처럼 상쾌한 승리를!", "여름"),
            FortuneCookie("여름 장마처럼 골이 쏟아질 거예요!", "여름"),
            FortuneCookie("뜨거운 태양 아래 빛나는 선수들!", "여름"),
            FortuneCookie("여름밤의 승리는 특별히 더 달콤해요!", "여름"),
            FortuneCookie("더위도 잊게 하는 환상적인 경기!", "여름")
        )

        // 가을 시즌 메시지 (10개)
        private val autumnMessages = listOf(
            FortuneCookie("가을 하늘처럼 높이 날아오르는 승리!", "가을"),
            FortuneCookie("풍성한 가을처럼 골도 풍성하게!", "가을"),
            FortuneCookie("단풍처럼 물드는 승리의 계절!", "가을"),
            FortuneCookie("시즌 막바지 치열한 순위 경쟁!", "가을"),
            FortuneCookie("가을 바람에 실려오는 좋은 소식!", "가을"),
            FortuneCookie("추석처럼 풍요로운 승리가 가득!", "가을"),
            FortuneCookie("선선한 가을 경기장에서 뜨거운 응원을!", "가을"),
            FortuneCookie("황금빛 가을처럼 황금 같은 3점!", "가을"),
            FortuneCookie("가을의 결실처럼 좋은 결과가!", "가을"),
            FortuneCookie("천고마비! 팀도 더 강해지는 계절!", "가을")
        )

        // 겨울 시즌 메시지 (10개)
        private val winterMessages = listOf(
            FortuneCookie("추운 겨울에도 응원의 열기는 뜨겁게!", "겨울"),
            FortuneCookie("새해에는 더 큰 승리가 기다립니다!", "겨울"),
            FortuneCookie("겨울 이적 시장의 좋은 소식을 기대해요!", "겨울"),
            FortuneCookie("눈처럼 순백의 클린시트!", "겨울"),
            FortuneCookie("따뜻한 핫초코처럼 마음 따뜻한 승리!", "겨울"),
            FortuneCookie("시즌 준비하는 선수들을 응원합니다!", "겨울"),
            FortuneCookie("겨울을 이기면 봄의 영광이!", "겨울"),
            FortuneCookie("연말 시상식의 주인공이 될 거예요!", "겨울"),
            FortuneCookie("크리스마스 선물 같은 승리!", "겨울"),
            FortuneCookie("따뜻한 경기장에서 뜨거운 응원을!", "겨울")
        )

        private val baseMessages = cheerMessages + matchMessages + wisdomMessages + funnyMessages
    }
}

data class FortuneCookie(
    val message: String,
    val category: String
)
