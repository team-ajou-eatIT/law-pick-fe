import { useState } from "react";
import { ArrowLeft, Users, Calendar, CheckCircle, Clock, ArrowRight, FileText, Target, User, Hash, BookOpen, ExternalLink, FileSignature } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

interface BillAnalysisPageProps {
  onBack: () => void;
}

interface Bill {
  id: number;
  title: string;
  description: string;
  category: string;
  proposer: string;
  date: string;
  status: 'passed' | 'pending' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  analysisReport: {
    proposalReason: string;
    coreContent: string;
    committeeArguments: string;
    expectedEffects: string;
    risks: string;
  };
  lawText: string;
  changes: string[];
  targets: string[];
  implementation: {
    date: string;
    phase: string;
    details: string;
  };
  publication: {
    transferDate: string;
    lawName: string;
    publicationDate: string;
    publicationNumber: string;
  };
  sources: {
    title: string;
    url: string;
  }[];
}

export function BillAnalysisPage({ onBack }: BillAnalysisPageProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const youthBills: Bill[] = [
    {
      id: 1,
      title: "청년 기본법 개정안",
      description: "청년의 연령 기준을 현행 34세에서 39세로 확대하고, 청년정책 지원 대상을 넓히는 개정안",
      category: "취업",
      proposer: "국회 교육위원회",
      date: "2024.12.22",
      status: 'passed',
      priority: 'high',
      analysisReport: {
        proposalReason: "현재 청년 기본법상 청년의 연령 기준은 34세로 설정되어 있으나, 평균 결혼 연령 상승, 만혼화 추세, 고용 시장의 변화 등으로 인해 35세 이상 청년층도 여전히 구직, 주거, 창업 등 다양한 분야에서 어려움을 겪고 있습니다. 이에 실질적으로 청년정책의 혜택이 필요한 연령층을 포괄할 수 있도록 청년의 연령 기준을 39세로 확대하고자 합니다.",
        coreContent: "청년 기본법 제3조(정의) 중 '청년'의 연령 범위를 '19세 이상 34세 이하'에서 '19세 이상 39세 이하'로 개정합니다. 이에 따라 청년정책 대상자가 약 200만명 추가 포함되며, 청년 일자리, 주거, 교육, 문화 등 모든 청년정책의 적용 범위가 확대됩니다. 다만, 개별 법령 및 사업의 특성에 따라 연령 기준을 달리 정할 수 있는 예외 조항을 두어 정책의 유연성을 확보합니다.",
        committeeArguments: "교육위원회는 본 개정안이 청년층의 실질적인 어려움을 반영한 합리적인 조치라고 평가했습니다. 다만 일부 위원들은 재정 부담 증가에 대한 우려를 제기했으며, 특히 청년 일자리 사업과 주거 지원 사업의 예산 확대 필요성을 지적했습니다. 이에 대해 정부는 단계적 시행 방안을 제시했으며, 기존 사업의 효율성을 높이면서 점진적으로 대상을 확대해 나가겠다는 입장을 밝혔습니다. 최종적으로 청년층의 실질적 필요성이 재정 부담보다 크다는 데 의견이 모아졌습니다.",
        expectedEffects: "약 200만명의 35~39세 청년이 새롭게 청년정책 대상에 포함되어 일자리, 주거, 창업 등 다양한 분야에서 정책적 지원을 받을 수 있게 됩니다. 특히 만혼 추세에 따른 신혼부부 주거 지원, 경력단절 후 재취업 지원, 중년 창업 지원 등의 효과가 기대됩니다. 또한 청년 정책의 실효성이 높아져 청년층의 삶의 질 향상과 사회 안정에 기여할 것으로 예상됩니다.",
        risks: "가장 큰 리스크는 재정 부담 증가입니다. 대상자가 약 200만명 증가함에 따라 청년 일자리 사업, 주거 지원, 교육 지원 등 모든 분야에서 예산 소요가 늘어날 것으로 예상됩니다. 또한 기존 34세 이하 청년과의 형평성 문제나, 지원 대상 확대로 인한 1인당 지원 규모 축소 가능성도 존재합니다. 이에 따라 정부는 단계적 시행 계획과 충분한 예산 확보 방안을 마련해야 하며, 사업별 우선순위를 명확히 하여 효율적으로 집행할 필요가 있습니다."
      },
      changes: [
        "청년 연령 기준: 34세 → 39세로 확대",
        "청년정책 대상자 약 200만명 추가 포함",
        "청년 일자리 지원사업 확대",
        "청년 주거지원 정책 대상 확대"
      ],
      targets: [
        "35세~39세 연령층",
        "구직 활동 중인 청년",
        "창업을 준비하는 청년",
        "주거 문제를 겪는 청년"
      ],
      lawText: `제1조(목적) 이 법은 청년의 권리 및 책임과 국가와 지방자치단체의 청년에 대한 책무 등을 정하고 청년정책의 수립·조정 및 청년 지원 등에 관한 기본적인 사항을 규정함으로써 청년의 사회참여 확대 및 발전을 도모하고 청년의 삶의 질 향상에 이바지함을 목적으로 한다.

제2조(기본이념) 청년정책은 청년이 사회의 당당한 구성원으로서 존중받고, 청년의 능력을 개발하고 역량을 발휘할 수 있도록 하며, 청년이 자립할 수 있도록 지원하는 것을 기본이념으로 한다.

제3조(정의) 이 법에서 사용하는 용어의 뜻은 다음과 같다.
1. "청년"이란 19세 이상 39세 이하인 사람을 말한다. 다만, 다른 법령과 조례에서 청년에 대한 연령을 다르게 정하고 있는 경우에는 그에 따를 수 있다.
2. "청년정책"이란 청년의 권익증진 및 발전을 위하여 수립·시행하는 정책을 말한다.

제4조(청년의 권리와 책임) ① 청년은 인간으로서의 존엄과 가치를 가지며 행복을 추구할 권리를 가진다.
② 청년은 교육, 고용, 주거, 문화, 복지, 건강 등 모든 영역에서 차별받지 아니하고 자유롭게 사회활동에 참여할 권리를 가진다.
③ 청년은 사회의 정당한 구성원으로서 책임을 다하여야 한다.

제5조(국가와 지방자치단체의 책무) ① 국가와 지방자치단체는 청년정책을 수립·시행하여야 한다.
② 국가와 지방자치단체는 청년정책을 수립·시행할 때 청년의 참여를 보장하고 청년의 의견을 수렴하여야 한다.
③ 국가와 지방자치단체는 청년정책이 실질적 효과를 거둘 수 있도록 필요한 행정적·재정적 지원방안을 마련하여야 한다.`,
      implementation: {
        date: "2025.03.01",
        phase: "시행 예정",
        details: "2025년 3월 1일부터 확대된 연령 기준이 적용되며, 기존 청년정책 사업들이 순차적으로 대상을 확대할 예정입니다."
      },
      publication: {
        transferDate: "2024.12.28",
        lawName: "청년 기본법 일부개정법률",
        publicationDate: "2025.01.10",
        publicationNumber: "제19876호"
      },
      sources: [
        {
          title: "국가법령정보센터 - 청년 기본법",
          url: "https://www.law.go.kr"
        },
        {
          title: "국회 의안정보시스템",
          url: "https://likms.assembly.go.kr"
        },
        {
          title: "교육위원회 회의록",
          url: "https://www.assembly.go.kr"
        }
      ]
    },
    {
      id: 2,
      title: "청년 주거지원 특별법",
      description: "청년 전세대출 한도 상향 및 지원 조건 완화를 통한 주거 안정성 강화 법안",
      category: "부동산",
      proposer: "국토교통위원회",
      date: "2024.12.20",
      status: 'passed',
      priority: 'high',
      analysisReport: {
        proposalReason: "최근 주택 가격 및 전세가격의 급등으로 청년층의 주거 부담이 크게 증가하고 있으며, 특히 수도권 지역의 경우 기존 전세대출 한도로는 실질적인 주거 안정을 도모하기 어려운 실정입니다. 청년층의 안정적인 주거 환경 조성은 결혼, 출산, 경제활동 등 인생 전반에 걸쳐 중요한 영향을 미치므로, 전세대출 한도 상향과 지원 조건 완화를 통해 청년 주거 안정성을 강화하고자 합니다.",
        coreContent: "청년 전세대출 한도를 기존 2억원에서 3억원으로 상향하고, 소득 요건을 연소득 5천만원에서 7천만원으로 완화합니다. 또한 LTV(주택담보인정비율) 비율을 70%에서 80%로 확대하여 자기부담금을 줄이고, 대출 금리는 기준금리 대비 1.5%p 우대 적용합니다. 만 19세부터 39세까지의 무주택 청년이 대상이며, 신혼부부의 경우 추가 우대 혜택을 제공합니다.",
        committeeArguments: "국토교통위원회는 청년 주거 문제의 심각성을 인정하고 본 법안의 필요성에 공감했습니다. 다만 일부 의원들은 대출 한도 확대가 오히려 전세가격 상승을 부추길 수 있다는 우려를 표명했으며, 주택 공급 확대 정책이 병행되어야 한다고 주장했습니다. 또한 금융기관의 대출 리스크 증가와 재정 부담에 대한 논의도 있었으나, 정부의 보증 강화 및 단계적 시행 계획으로 우려를 해소했습니다.",
        expectedEffects: "청년층의 주거 선택권이 확대되어 수도권을 포함한 다양한 지역에서 안정적인 주거가 가능해집니다. 전세대출 한도 상향으로 약 15만 가구의 청년이 추가로 혜택을 받을 것으로 예상되며, 소득 요건 완화로 중산층 청년도 지원 대상에 포함됩니다. 이는 청년층의 결혼 및 출산 결정에 긍정적 영향을 미쳐 저출산 문제 완화에도 기여할 것으로 기대됩니다.",
        risks: "대출 한도 확대가 전세가격 상승을 유발할 수 있으며, 이는 실질적인 주거 부담 완화 효과를 상쇄할 우려가 있습니다. 또한 청년층의 과도한 부채 증가로 인한 재무 건전성 악화 가능성이 존재합니다. 금융기관의 대출 리스크 증가와 정부 보증 부담도 증가할 수 있으므로, 주택 공급 확대 정책과 병행 추진이 필수적이며, 대출자의 상환 능력에 대한 철저한 심사가 요구됩니다."
      },
      changes: [
        "청년 전세대출 한도: 2억원 → 3억원으로 상향",
        "소득 요건 완화: 연소득 5천만원 → 7천만원",
        "LTV 비율 확대: 70% → 80%",
        "대출 금리 우대: 기준금리 -1.5%p"
      ],
      targets: [
        "만 19세~39세 무주택 청년",
        "신혼부부 및 예비 신혼부부",
        "대학생 및 사회초년생",
        "지방에서 수도권으로 이주하는 청년"
      ],
      lawText: `제1조(목적) 이 법은 청년층의 주거 안정을 위하여 필요한 지원에 관한 사항을 정함으로써 청년의 주거 안정과 주거수준 향상에 이바지함을 목적으로 한다.

제2조(정의) 이 법에서 "청년"이란 만 19세 이상 39세 이하의 무주택자를 말한다.

제3조(국가 및 지방자치단체의 책무) ① 국가 및 지방자치단체는 청년의 주거 안정을 위한 시책을 수립·시행하여야 한다.
② 국가 및 지방자치단체는 청년 주거지원에 필요한 재원을 확보하고 효율적으로 운용하여야 한다.

제4조(청년 주거금융 지원) ① 국가는 청년의 주거 안정을 위하여 전세자금 대출을 지원할 수 있다.
② 제1항에 따른 전세자금 대출의 한도는 3억원으로 하되, 대통령령으로 정하는 바에 따라 조정할 수 있다.
③ 전세자금 대출을 받을 수 있는 청년은 다음 각 호의 요건을 모두 충족하여야 한다.
  1. 연간 소득이 7천만원 이하일 것
  2. 무주택 세대주일 것
  3. 전용면적 85제곱미터 이하의 주택에 전세 계약을 체결하였거나 체결할 것

제5조(대출조건 우대) ① 청년 전세자금 대출의 주택담보인정비율(LTV)은 80퍼센트로 한다.
② 청년 전세자금 대출의 금리는 기준금리에서 1.5퍼센트포인트를 우대한 금리로 한다.
③ 신혼부부의 경우 제1항 및 제2항에 따른 조건보다 우대하여 지원할 수 있다.

제6조(대출 심사 및 관리) 국가는 청년 전세자금 대출이 원활히 집행될 수 있도록 금융기관과 협력하고, 대출자의 상환 능력을 철저히 심사하여야 한다.`,
      implementation: {
        date: "2025.01.15",
        phase: "시행 중",
        details: "2025년 1월 15일부터 시행되며, 기존 대출자도 조건 변경 신청이 가능합니다."
      },
      publication: {
        transferDate: "2024.12.26",
        lawName: "청년 주거지원 특별법",
        publicationDate: "2025.01.05",
        publicationNumber: "제19865호"
      },
      sources: [
        {
          title: "국가법령정보센터 - 청년 주거지원 특별법",
          url: "https://www.law.go.kr"
        },
        {
          title: "국토교통부 청년 주거지원 포털",
          url: "https://www.molit.go.kr"
        },
        {
          title: "국회 국토교통위원회 심사보고서",
          url: "https://www.assembly.go.kr"
        }
      ]
    },
    {
      id: 3,
      title: "청년창업지원법 개정안",
      description: "창업 지원금 확대 및 세제 혜택 강화를 통한 청년 창업 생태계 활성화 방안",
      category: "금융",
      proposer: "중소벤처기업위원회",
      date: "2024.12.18",
      status: 'passed',
      priority: 'medium',
      analysisReport: {
        proposalReason: "청년 실업률 증가와 함께 창업을 통한 자기주도적 경제활동에 대한 관심이 높아지고 있으나, 초기 자본 부족과 높은 실패율로 인해 청년들이 창업을 주저하는 경우가 많���니다. 특히 기술 기반 창업과 소셜벤처의 경우 초기 투자 규모가 커서 기존 지원금으로는 부족한 실정입니다. 청년 창업 생태계를 활성화하고 실패에 대한 부담을 줄여 재도전 문화를 조성하기 위해 본 개정안을 발의합니다.",
        coreContent: "창업 지원금 한도를 기존 5천만원에서 1억원으로 확대하고, 법인세 면제 기간을 2년에서 3년으로 연장합니다. 창업 준비금에 대한 소득공제 한도도 상향하여 창업 전 준비 단계부터 지원을 강화합니다. 특히 창업 실패 시 재기를 돕는 프로그램을 신설하여 창업 실패자의 신용 회복을 지원하고, 재창업 시 우대 조건을 제공합니다. 만 39세 이하 예비 창업자와 창업 3년 이내 청년 사업자가 주요 대상입니다.",
        committeeArguments: "중소벤처기업위원회는 청년 창업 지원 강화의 필요성에 적극 동의했으나, 일부 위원들은 지원금 확대가 도덕적 해이를 유발할 수 있다는 우려를 제기했습니다. 이에 대해 지원금 집행 과정의 투명성을 강화하고, 사업계획 심사를 보다 엄격히 하기로 했습니다. 또한 재기 지원 프로그램의 경우 실패 사유를 분석하여 고의적 실패나 부실 경영은 지원 대상에서 제외하기로 했습니다. 전체적으로 청년 창업 생태계 활성화가 국가 경쟁력 강화에 필수적이라는 데 의견이 모아졌습니다.",
        expectedEffects: "창업 지원금 확대로 연간 약 3만명의 청년 창업가가 혜택을 받을 것으로 예상되며, 특히 기술 기반 스타트업과 소셜벤처의 증가가 기대됩니다. 법인세 면제 기간 연장으로 초기 사업 안정화 기간이 확보되어 창업 성공률이 높아질 것으로 전망됩니다. 재기 지원 프로그램은 실패를 두려워하지 않는 창업 문화를 조성하여 혁신적인 도전이 활성화될 것으로 기대됩니다.",
        risks: "지원금 확대에 따른 재정 부담 증가가 우려되며, 특히 심사 과정이 느슨해질 경우 부실 창업이나 지원금 오용 사례가 발생할 수 있습니다. 또한 창업 실패 시 재기 지원이 오히려 책임 의식을 약화시킬 수 있다는 지적도 있습니다. 이를 방지하기 위해 지원금 심사 기준을 명확히 하고, 사후 관리 체계를 강화해야 합니다. 또한 창업 교육 프로그램을 병행하여 창업 성공률 자체를 높이는 노력이 필요합니다."
      },
      changes: [
        "창업 지원금 한도: 5천만원 → 1억원으로 확대",
        "법인세 면제 기간: 2년 → 3년으로 연장",
        "창업 준비금 소득공제 한도 상향",
        "���업 실패 시 재기 지원 프로그램 신설"
      ],
      targets: [
        "만 39세 이하 예비 창업자",
        "창업 3년 이내 청년 사업자",
        "기술창업을 준비하는 청년",
        "소셜벤처 창업 청년"
      ],
      lawText: `제1조(목적) 이 법은 청년의 창업을 촉진하고 청년창업기업의 경영 안정과 성장을 지원함으로써 국민경제의 발전에 이바지함을 목적으로 한다.

제2조(정의) 이 법에서 "청년창업자"란 만 39세 이하의 사람으로서 중소기업을 창업한 자를 말한다.

제3조(국가와 지방자치단체의 책무) 국가와 지방자치단체는 청년의 창업을 활성화하고 청년창업기업이 성장할 수 있도록 필요한 시책을 마련하여야 한다.

제4조(창업 지원금) ① 국가는 청년창업자에게 사업 초기 자금을 지원할 수 있다.
② 제1항에 따른 지원금의 한도는 1억원으로 하되, 기술창업 및 소셜벤처의 경우 추가 지원할 수 있다.
③ 지원금의 신청 및 심사, 집행 등에 관한 사항은 대통령령으로 정한다.

제5조(세제 지원) ① 청년창업기업에 대하여는 사업 개시일부터 3년간 법인세를 면제한다.
② 창업 준비금에 대하여는 소득공제를 적용하되, 그 한도는 대통령령으로 정한다.
③ 창업 초기 시설 투자 및 연구개발비에 대하여 세액공제를 적용할 수 있다.

제6조(창업 실패자 재기 지원) ① 국가는 창업에 실패한 청년이 재기할 수 있도록 지원 프로그램을 운영하여야 한다.
② 제1항에 따른 지원 프로그램에는 다음 각 호의 사항이 포함되어야 한다.
  1. 신용 회복 지원
  2. 재창업 교육 및 컨설팅
  3. 재창업 자금 우대 지원
③ 고의적 실패 또는 부실 경영으로 인한 실패의 경우 지원 대상에서 제외한다.

제7조(창업교육) 국가와 지방자치단체는 청년의 창업 역량 강화를 위한 교육 프로그램을 운영하여야 한다.`,
      implementation: {
        date: "2025.04.01",
        phase: "시행 예정",
        details: "2025년 4월 1일부터 시행되며, 기존 창업자들도 소급 적용하여 혜택을 받을 수 있습니다."
      },
      publication: {
        transferDate: "2024.12.24",
        lawName: "청년창업지원법 일부개정법률",
        publicationDate: "2025.01.08",
        publicationNumber: "제19870호"
      },
      sources: [
        {
          title: "국가법령정보센터 - 청년창업지원법",
          url: "https://www.law.go.kr"
        },
        {
          title: "중소벤처기업부 창업지원포털",
          url: "https://www.mss.go.kr"
        },
        {
          title: "국회 중소벤처기업위원회 의안자료",
          url: "https://www.assembly.go.kr"
        }
      ]
    },
    {
      id: 4,
      title: "청년 고용촉진 특별법",
      description: "청년 일자리 창출과 고용 안정성 향상을 위한 기업 인센티브 및 지원 확대",
      category: "취업",
      proposer: "환경노동위원회",
      date: "2024.12.15",
      status: 'passed',
      priority: 'high',
      analysisReport: {
        proposalReason: "청년 실업률이 지속적으로 높은 수준을 유지하고 있으며, 특히 양질의 일자리 부족 문제가 심각합니다. 많은 청년들이 비정규직이나 단기 계약직으로 경력을 시작하면서 고용 불안정에 시달리고 있습니다. 기업들은 청년 채용에 따른 교육 비용과 리스크를 부담스러워하고 있어, 청년 채용을 촉진하기 위한 인센티브가 필요한 상황입니다. 본 법안은 기업과 청년 모두에게 혜택을 ���공하여 청년 고용을 활성화하고자 합니다.",
        coreContent: "청년을 정규직으로 채용하는 기업에 대한 세액공제를 확대하고, 청년 인턴십 프로그램 참여 기업에 지원금을 인상합니다. 특히 인턴을 정규직으로 전환하는 기업에는 별도의 인센티브를 신설하여 안정적인 고용을 유도합니다. 또한 구직 청년을 위한 직업교육훈련 프로그램을 확대하여 취업 역량을 강화하고, 기업이 원하는 인재를 양성합니다. 15세부터 34세까지의 구직 청년이 주요 대상이며, 장기 실업자에게는 추가 지원을 제공합니다.",
        committeeArguments: "환경노동위원회는 청년 고용 문제의 시급성을 인정하고 본 법안을 적극 지지했습니다. 다만 일부 위원들은 세액공제 확대가 대기업에 유리하고 중소기업의 실질적 혜택은 제한적일 수 있다는 우려를 표명했습니다. 이에 대해 중소기업에 대한 공제율을 더 높게 설정하고, 지원 절차를 간소화하기로 했습니다. 또한 인턴십 프로그램이 저임금 노동력 활용 수단으로 악용되지 않도록 최저 임금 준수와 교육 의무를 강화하기로 합의했습니다.",
        expectedEffects: "연간 약 10만명의 청년이 새로운 일자리를 얻을 것으로 예상되며, 특히 정규직 비율이 증가하여 고용 안정성이 향상될 것으로 기대됩니다. 기업 입장에서는 세액공제와 지원금으로 인건비 부담이 줄어들어 청년 채용을 늘릴 유인이 생깁니다. 직업교육훈련 프로그램 확대로 청년들의 실무 역량이 강화되어 기업과의 미스매치가 줄어들 것으로 전망됩니다.",
        risks: "세액공제 확대로 인한 세수 감소와 재정 부담 증가가 우려됩니다. 또한 기업들이 인센티브만 받고 실제 청년 고용을 늘리지 않거나, 단기 채용 후 해고하는 등의 부작용이 발생할 수 있습니다. 인턴십 프로그램이 저임금 노동 착취 수단으로 악용될 가능성도 존재합니다. 이를 방지하기 위해 기업의 고용 유지 의무를 명확히 하고, 위반 시 지원금 환수 및 제재 조치를 강화해야 합니다."
      },
      changes: [
        "청년 채용 기업 세액공제 확대",
        "청년 인턴십 지원금 인상",
        "정규직 전환 인센티브 신설",
        "직업교육훈련 프로그램 확대"
      ],
      targets: [
        "구직 중인 15~34세 청년",
        "청년 채용 계획이 있는 기업",
        "직업 전환을 희망하는 청년",
        "장기간 구직 활동 중인 청년"
      ],
      lawText: `제1조(목적) 이 법은 청년 고용을 촉진하고 청년의 고용 안정을 도모하기 위하여 국가 및 지방자치단체와 기업의 책무를 명확히 하고 필요한 지원시책을 규정함을 목적으로 한다.

제2조(정의) 이 법에서 "청년"이란 15세 이상 34세 이하인 사람을 말한다.

제3조(국가 등의 책무) ① 국가와 지방자치단체는 청년 고용 촉진을 위한 종합적인 시책을 수립·시행하여야 한다.
② 기업은 청년에게 양질의 일자리를 제공하고 고용 안정을 위해 노력하여야 한다.

제4조(청년 채용 기업에 대한 지원) ① 청년을 정규직으로 채용한 기업에 대하여는 세액공제를 확대 적용한다.
② 제1항에 따른 세액공제율은 대기업 10퍼센트, 중견기업 15퍼센트, 중소기업 20퍼센트로 한다.
③ 청년 채용 후 2년 이상 고용을 유지한 기업에는 추가 세액공제를 적용할 수 있다.

제5조(청년 인턴십 지원) ① 국가는 기업이 청년 인턴을 채용할 경우 인턴십 지원금을 지급한다.
② 인턴십 프로그램은 최소 3개월 이상 운영하여야 하며, 최저임금 이상을 지급하여야 한다.
③ 인턴십 프로그램에는 실무교육과 직업훈련이 포함되어야 한다.

제6조(정규직 전환 인센티브) 인턴을 정규직으로 전환한 기업에 대하여는 1인당 500만원의 인센티브를 지급한다.

제7조(직업교육훈련) ① 국가와 지방자치단체는 청년의 취업 역량 강화를 위한 직업교육훈련 프로그램을 운영하여야 한다.
② 장기 실업 청년에 대하여는 우선적으로 교육훈련 기회를 제공하여야 한다.

제8조(고용유지 의무 및 제재) ① 지원금을 받은 기업은 최소 2년간 청년 고용을 유지하여야 한다.
② 제1항을 위반한 기업에 대하여는 지원금을 환수하고, 3년간 지원 대상에서 제외한다.`,
      implementation: {
        date: "2025.02.01",
        phase: "시행 예정",
        details: "2025년 2월 1일부터 시행되며, 관련 시스템 구축이 완료되는 대로 순차 적용됩니다."
      },
      publication: {
        transferDate: "2024.12.22",
        lawName: "청년 고용촉진 특별법",
        publicationDate: "2025.01.03",
        publicationNumber: "제19860호"
      },
      sources: [
        {
          title: "국가법령정보센터 - 청년 고용촉진 특별법",
          url: "https://www.law.go.kr"
        },
        {
          title: "고용노동부 청년고용정책",
          url: "https://www.moel.go.kr"
        },
        {
          title: "국회 환경노동위원회 의안자료",
          url: "https://www.assembly.go.kr"
        }
      ]
    },
    {
      id: 5,
      title: "청년 교육비 지원 확대법",
      description: "대학등록금 부담 경감 및 평생교육 기회 확대를 위한 지원 체계 구축",
      category: "교육",
      proposer: "교육위원회",
      date: "2024.12.10",
      status: 'pending',
      priority: 'medium',
      analysisReport: {
        proposalReason: "대학등록금과 교육비 부담이 청년층과 가계에 큰 부담이 되고 있으며, 특히 저소득층 청년의 경우 경제적 이유로 학업을 중단하거나 아르바이트로 학업에 집중하지 못하는 경우가 많습니다. 또한 급변하는 산업 환경에서 평생교육과 재교육의 중요성이 커지고 있으나, 비용 부담으로 인해 학습 기회가 제한되고 있습니다. 청년층의 교육 기회를 확대하고 미래 경쟁력을 강화하기 위해 본 법안을 제안합니다.",
        coreContent: "국가장학금 지원 대상을 소득 8분위까지 확대하고 지원 금액을 인상합니다. 학자금 대출 이자를 추가로 감면하여 상환 부담을 줄이고, 졸업 후 소득이 일정 수준 이하인 경우 상환을 유예하는 제도를 도입합니다. 직업 전환이나 신기술 습득을 위한 재교육 프로그램을 무료로 제공하고, 온라인 교육 플랫폼을 구축하여 시간과 장소에 구애받지 않고 학습할 수 있는 환경을 조성합니다.",
        committeeArguments: "교육위원회는 교��� 기회 확대의 필요성에 공감했으나, 막대한 재정 소요에 대한 우려가 제기되었습니다. 특히 국가장학금 확대에 따른 연간 1조원 이상의 추가 예산이 필요할 것으로 추산되어, 단계적 시행 방안이 논의되었습니다. 일부 위원들은 무상 지원보다는 대출 조건 개선이 더 효과적일 수 있다는 의견을 제시했으나, 최종적으로는 저소득층 지원을 우선하되 중산층까지 단계적으로 확대하기로 합의했습니다.",
        expectedEffects: "약 50만명의 대학생이 추가로 장학금 혜택을 받게 되어 교육비 부담이 크게 줄어들 것으로 예상됩니다. 학자금 대출 이자 감면으로 졸업 후 상환 부담이 줄어들어 청년들의 경제적 출발이 수월해질 것입니다. 직업재교육 프로그램을 통해 산업 수요에 맞는 인재가 양성되고, 온라인 교육 플랫폼으로 지역과 시간의 제약 없이 누구나 학습 기회를 가질 수 있게 됩니다.",
        risks: "가장 큰 리스크는 막대한 재정 부담입니다. 국가장학금 확대만으로도 연간 1조원 이상의 예산이 추가로 필요하며, 온라인 교육 플랫폼 구축과 운영에도 상당한 비용이 소요됩니다. 또한 장학금 확대가 대학의 등록금 인상을 유발할 수 있다는 우려도 있습니다. 무료 재교육 프로그램의 경우 실질적인 취업 효과가 낮을 수 있어, 산업 수요와 연계된 커리큘럼 개발이 필수적입니다. 단계적 시행과 철저한 성과 평가를 통해 효율성을 높여야 합니다."
      },
      changes: [
        "국가장학금 지원 대상 확대",
        "학자금 대출 이자 추가 감면",
        "직업재교육 프로그램 무료 제공",
        "온라인 교육 플랫폼 구축"
      ],
      targets: [
        "대학생 및 대학원생",
        "평생교육을 희망하는 청년",
        "직업 재교육이 필요한 청년",
        "저소득층 청년 학습자"
      ],
      lawText: `제1조(목적) 이 법은 청년의 교육비 부담을 경감하고 평생교육 기회를 확대하여 청년의 교육받을 권리를 보장하고 미래 경쟁력을 강화함을 목적으로 한다.

제2조(정의) 이 법에서 "청년"이란 만 19세 이상 34세 이하인 사람을 말한다.

제3조(국가 및 지방자치단체의 책무) 국가와 지방자치단체는 청년의 교육비 부담을 줄이고 평생학습 기회를 확대하기 위한 시책을 수립·시행하여야 한다.

제4조(국가장학금 지원 확대) ① 국가는 청년의 대학 교육비 부담을 줄이기 위하여 국가장학금을 지원한다.
② 국가장학금 지원 대상은 소득 8분위 이하 가구의 대학생 및 대학원생으로 한다.
③ 국가장학금 지원 금액 및 지급 기준은 대통령령으로 정한다.

제5조(학자금 대출 이자 감면) ① 청년이 학자금 대출을 받은 경우 대출 이자를 감면한다.
② 졸업 후 연간 소득이 대통령령으로 정하는 금액 이하인 경우 원리금 상환을 유예할 수 있다.
③ 상환 유예 기간 중에는 이자가 발생하지 아니한다.

제6조(직업재교육 프로그램) ① 국가와 지방자치단체는 청년의 직업 전환 및 신기술 습득을 위한 재교육 프로그램을 무료로 제공하여야 한다.
② 재교육 프로그램은 산업 수요를 반영하여 구성하여야 한다.
③ 재교육 프로그램 참여자에게는 훈련수당을 지급할 수 있다.

제7조(온라인 교육 플랫폼) ① 국가는 청년이 시간과 장소에 구애받지 않고 학습할 수 있도록 온라인 교육 플랫폼을 구축·운영하여야 한다.
② 온라인 교육 플랫폼은 무료로 이용할 수 있어야 하며, 다양한 분야의 교육 콘텐츠를 제공하여야 한다.

제8조(성과 평가) 국가는 이 법에 따른 지원사업의 효과성을 평가하고, 그 결과를 시책에 반영하여야 한다.`,
      implementation: {
        date: "2025.09.01",
        phase: "심의 중",
        details: "현재 국회 심의 중이며, 통과 시 2025년 9월 1일부터 단계적으로 시행될 예정입니다."
      },
      publication: {
        transferDate: "미정",
        lawName: "청년 교육비 지원 확대법",
        publicationDate: "미정",
        publicationNumber: "미정"
      },
      sources: [
        {
          title: "국가법령정보센터 - 청년 교육비 지원 확대법",
          url: "https://www.law.go.kr"
        },
        {
          title: "교육부 국가장학금 포털",
          url: "https://www.kosaf.go.kr"
        },
        {
          title: "국회 교육위원회 심사보고서",
          url: "https://www.assembly.go.kr"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed': return '가결';
      case 'pending': return '심의중';
      case 'rejected': return '부결';
      default: return '미정';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '미정';
    }
  };

  const categories = ['all', '부동산', '금융', '취업', '교육'];
  const filteredBills = selectedCategory === 'all' 
    ? youthBills 
    : youthBills.filter(bill => bill.category === selectedCategory);

  if (selectedBill) {
    return (
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedBill(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-semibold">{selectedBill.title}</h1>
                  <p className="text-sm text-muted-foreground">법안 상세 분석</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 법안 상세 정보 */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{selectedBill.title}</CardTitle>
                    <p className="text-muted-foreground">{selectedBill.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">발의기관:</span>
                    <p className="font-medium">{selectedBill.proposer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">통과일:</span>
                    <p className="font-medium">{selectedBill.date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">분야:</span>
                    <p className="font-medium">{selectedBill.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 분석 탭 */}
            <Tabs defaultValue="report" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="report" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  안건 분석 리포트
                </TabsTrigger>
                <TabsTrigger value="lawtext" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  법률 원문
                </TabsTrigger>
                <TabsTrigger value="core" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  핵심 내용
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  출처 및 원문
                </TabsTrigger>
              </TabsList>

              <TabsContent value="report" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      안건 분석 리포트
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 제안이유 */}
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold text-blue-800 mb-2">제안이유</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedBill.analysisReport.proposalReason}
                      </p>
                    </div>

                    {/* 핵심내용 */}
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="font-semibold text-green-800 mb-2">핵심내용</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedBill.analysisReport.coreContent}
                      </p>
                    </div>

                    {/* 위원회 논거 및 주요 쟁점 */}
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <h4 className="font-semibold text-purple-800 mb-2">위원회 논거 및 주요 쟁점</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedBill.analysisReport.committeeArguments}
                      </p>
                    </div>

                    {/* 예상효과 */}
                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <h4 className="font-semibold text-amber-800 mb-2">예상효과</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedBill.analysisReport.expectedEffects}
                      </p>
                    </div>

                    {/* 리스크 */}
                    <div className="border-l-4 border-red-500 pl-4 py-2">
                      <h4 className="font-semibold text-red-800 mb-2">리스크</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedBill.analysisReport.risks}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lawtext" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      법률 원문
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] w-full rounded-md border p-6">
                      <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {selectedBill.lawText}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="core" className="space-y-4">
                {/* 시행 시기 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      시행 시기
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">시행일</h4>
                          <p className="text-lg font-bold text-orange-900">{selectedBill.implementation.date}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">현재 상태</h4>
                          <p className="text-lg font-bold text-orange-900">{selectedBill.implementation.phase}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">시행 세부사항</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedBill.implementation.details}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 공포 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSignature className="h-5 w-5 text-blue-600" />
                      공포 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border-l-4 border-blue-500 pl-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">정부이송일</p>
                        <p className="font-semibold">{selectedBill.publication.transferDate}</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">공포일자</p>
                        <p className="font-semibold">{selectedBill.publication.publicationDate}</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">공포법률명</p>
                        <p className="font-semibold">{selectedBill.publication.lawName}</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">공포번호</p>
                        <p className="font-semibold">{selectedBill.publication.publicationNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 주요 변경점 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-green-600" />
                      주요 변경점
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedBill.changes.map((change, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{change}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 주요 대상자 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      주요 대상자
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {selectedBill.targets.map((target, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          <p className="text-sm">{target}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-cyan-600" />
                      출처 및 원문
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        본 법안에 대한 자세한 내용은 아래 출처를 통해 확인하실 수 있습니다.
                      </p>
                      {selectedBill.sources.map((source, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <ExternalLink className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{source.title}</h4>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-600 hover:underline break-all"
                            >
                              {source.url}
                            </a>
                          </div>
                        </div>
                      ))}
                      <div className="bg-blue-50 p-4 rounded-lg mt-6">
                        <p className="text-sm text-blue-900">
                          <strong>주의:</strong> 위 링크는 참고용이며, 실제 법령 적용 시에는 반드시 최신 법령을 확인하시기 바랍니다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="font-semibold">국회 가결안 분석 </h1>
                <p className="text-sm text-muted-foreground">청년 관련 법안 현황을 확인하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 카테고리 필터 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">청년 관련 법안</h2>
            <Badge variant="secondary">{filteredBills.length}건</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? '전체' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* 법안 목록 */}
        <div className="grid gap-6">
          {filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{bill.title}</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {bill.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {bill.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {bill.proposer}
                      </div>
                      <Badge variant="outline">{bill.category}</Badge>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedBill(bill)}
                    className="flex-shrink-0"
                  >
                    상세보기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">해당 카테고리의 법안이 없습니다</h3>
            <p className="text-muted-foreground mb-4">다른 카테고리를 선택해보세요.</p>
            <Button variant="outline" onClick={() => setSelectedCategory('all')}>
              전체 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}