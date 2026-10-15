import type { Locale } from "@/lib/i18n/config";

export const studentBenefitCategories = [
    "All",
    "Developer Tools",
    "AI & Cloud",
    "Design & UI/UX",
    "Learning & Productivity",
] as const;

export type StudentBenefitCategory = (typeof studentBenefitCategories)[number];

export interface StudentBenefit {
    id: string;
    title: string;
    provider: string;
    categories: Exclude<StudentBenefitCategory, "All">[];
    tagline: string;
    description: string;
    valueBadge?: string;
    badge?: string;
    pricingNote?: string;
    restrictionsNote?: string;
    /** ISO date (YYYY-MM-DD); display it with formatBenefitDate. */
    postedDate?: string;
    perks: string[];
    eligibility: string;
    howToClaim: string[];
    officialUrl: string;
    iconName: "github" | "google" | "figma" | "aws" | "code" | "azure" | "notion";
}

export interface StudentEmailGuideStep {
    stepNumber: string;
    title: string;
    detail: string;
}

export interface StudentEmailGuideData {
    portalName: string;
    portalUrl: string;
    formatExample: string;
    /** ISO date (YYYY-MM-DD); display it with formatBenefitDate. */
    postedDate: string;
    description: string;
    steps: StudentEmailGuideStep[];
    tips: string[];
}

export const studentEmailGuide: StudentEmailGuideData = {
    portalName: "Microsoft 365 Outlook Webmail",
    portalUrl: "https://outlook.cloud.microsoft/mail/",
    formatExample: "uxxxxxxxxxxxx@ms.kbu.ac.th",
    postedDate: "2026-09-13",
    description:
        "All enrolled KBU students receive a Microsoft 365 educational email account. This email is your primary key to unlocking thousands of dollars in free student developer tools, cloud credits, AI subscriptions, and software licenses.",
    steps: [
        {
            stepNumber: "01",
            title: "Open Outlook Cloud Portal",
            detail: "Navigate to https://outlook.cloud.microsoft/mail/ or portal.office.com using any modern browser.",
        },
        {
            stepNumber: "02",
            title: "Enter Your KBU Email",
            detail: "Input your student email address formatted as u[12-digit StudentID]@ms.kbu.ac.th (for example: u661305001234@ms.kbu.ac.th).",
        },
        {
            stepNumber: "03",
            title: "Use Your Microsoft Teams Password",
            detail: "Enter your password — this is the exact same password you use to log in to your Microsoft Teams account for university classes.",
        },
        {
            stepNumber: "04",
            title: "Check Inbox & Verification Links",
            detail: "When applying for developer packs (GitHub, Figma, AWS, JetBrains), verification links and codes will arrive in this Outlook inbox.",
        },
    ],
    tips: [
        "Always check both 'Focused' and 'Other' or 'Junk' tabs for verification emails.",
        "Keep your university email active throughout your study semesters to maintain automatic yearly license renewals.",
        "If you have trouble logging in or need a password reset, contact the KBU Computing and Technology Center (CTC) via Line Official: @comcenter or visit the on-campus helpdesk.",
    ],
};

export const studentBenefits: StudentBenefit[] = [
    {
        id: "github-student-pack",
        title: "GitHub Student Developer Pack",
        provider: "GitHub & Partners",
        categories: ["Developer Tools", "AI & Cloud", "Learning & Productivity"],
        tagline: "The world's most popular developer tools bundle, completely free.",
        description:
            "Access industry-standard developer tools, free cloud services, domain names, and learning resources while you are a student at KBU.",
        badge: "Essential",
        valueBadge: "$200,000+ Value",
        postedDate: "2026-09-13",
        perks: [
            "Free GitHub Pro account while you are a student",
            "Free GitHub Copilot AI coding assistant",
            "Free custom domain name (.me) from Namecheap for 1 year",
            "$100 DigitalOcean cloud credits and Heroku dyno credits",
            "Termius SSH client free subscription & Datadog monitoring",
            "Free Canva Pro for 1 year and Bootstrap Studio license",
        ],
        eligibility: "Enrolled KBU student with an active @ms.kbu.ac.th email or valid student ID card.",
        howToClaim: [
            "Log into your personal GitHub account (or create one).",
            "Navigate to GitHub Settings > Emails and add your KBU email: uxxxxxxxxxxxx@ms.kbu.ac.th.",
            "Check your Outlook inbox at https://outlook.cloud.microsoft/mail/ and click the confirmation link sent by GitHub.",
            "Disable any active VPN to allow GitHub to accurately verify your regional location.",
            "Visit education.github.com/pack and click 'Sign up for Student Developer Pack'.",
            "Select 'Kasem Bundit University', choose your verified @ms.kbu.ac.th email, and snap a clear photo of your student ID card.",
            "Approval is confirmed via email usually within 24–72 hours.",
        ],
        officialUrl: "https://education.github.com/pack",
        iconName: "github",
    },
    {
        id: "google-ai-plus",
        title: "Google AI Plus",
        provider: "Google One",
        categories: ["AI & Cloud", "Learning & Productivity"],
        tagline: "At no cost for 12 months with 400 GB cloud storage and advanced Gemini AI access.",
        description:
            "Exclusive Google AI Plus plan for students. Get THB 0/month for 12 months (instead of THB 189/month) featuring 400 GB total cloud storage across Photos, Drive & Gmail, Gemini Flash Thinking model, and Google's advanced creative AI suites.",
        badge: "12 Mos Free",
        valueBadge: "THB 0 / mo",
        pricingNote: "THB 0 per month for 12 months, instead of THB 189/mo (THB 189/mo after 12 months).",
        postedDate: "2026-09-13",
        restrictionsNote:
            "Age restrictions, language availability, system requirements, feature limits per session, and other restrictions may apply.",
        perks: [
            "Gemini app: Get usage limits that are 2x higher than without a Google AI plan, plus access to our Flash Thinking model",
            "Storage: 400 GB total storage for Google Photos, Drive & Gmail",
            "Google Flow: Get more access to our AI creative studio to create cinematic scenes and stories with Google's advanced generative models",
            "Google Search: More access to Nano Banana in Search",
            "Gemini in Gmail: Access Gemini directly in Gmail",
            "Gemini Notebook: More access to our research partner with Audio & Video Overviews, Quizzes, and more",
            "Google Flow Music: More access to our AI music studio",
        ],
        eligibility: "Enrolled university students with academic eligibility verification.",
        howToClaim: [
            "Visit the official Google AI Student offer page at https://one.google.com/ai-student.",
            "Sign in with your Google account.",
            "Verify your student enrollment status (select Kasem Bundit University and provide student proof or your @ms.kbu.ac.th email when prompted).",
            "If verification requires checking your university email, log in to your KBU Outlook mail at https://outlook.cloud.microsoft/mail/ using your Microsoft Teams password.",
            "Activate your 12 months of free Google AI Plus (THB 0/mo) and enjoy 400 GB storage and expanded Gemini AI limits.",
        ],
        officialUrl: "https://one.google.com/ai-student",
        iconName: "google",
    },
    {
        id: "figma-education",
        title: "Figma for Education",
        provider: "Figma",
        categories: ["Design & UI/UX", "Developer Tools"],
        tagline: "Free Figma Professional plan for modern UI/UX design and team collaboration.",
        description:
            "Design user interfaces, wireframes, interactive prototypes, and collaborate in real-time with your classmates and design teams without limitations.",
        badge: "Design",
        valueBadge: "$180/year Value",
        postedDate: "2026-09-13",
        perks: [
            "Free Figma Professional plan (unlimited projects, unlimited version history)",
            "Free FigJam whiteboard for brainstorming, sprint planning, and architecture diagrams",
            "Dev Mode access for seamless handoff between designers and developers",
            "Shared team libraries and design systems for group projects",
        ],
        eligibility: "Higher-education student enrolled at Kasem Bundit University.",
        howToClaim: [
            "Create or log into your Figma account.",
            "Head to figma.com/education/apply.",
            "Select 'Student' and enter Kasem Bundit University as your educational institution.",
            "Enter your KBU student email (uxxxxxxxxxxxx@ms.kbu.ac.th) and submit proof of enrollment.",
            "Verification is typically instant once email ownership is confirmed.",
        ],
        officialUrl: "https://www.figma.com/education/",
        iconName: "figma",
    },
    {
        id: "aws-student-rewards",
        title: "AWS Student Rewards & Skill Builder",
        provider: "Amazon Web Services",
        categories: ["AI & Cloud", "Learning & Productivity"],
        tagline:
            "Free 1-year AWS Skill Builder subscription, $30 in AWS cloud credits, and a $100 certification voucher.",
        description:
            "Join the official AWS Builder Center to unlock 1 full year of AWS Skill Builder Annual Subscription at no cost (normally $299/yr), access 900+ courses, hands-on cloud labs, and earn milestone rewards including $30 in AWS cloud credits and a $100 certification exam voucher.",
        badge: "1-Yr Sub Free",
        valueBadge: "$399+ Value",
        pricingNote: "100% Free for verified students via SheerID — no credit card required at any step.",
        postedDate: "2026-09-13",
        perks: [
            "1 Year Free AWS Skill Builder Annual Subscription (normally $299/year value)",
            "900+ on-demand cloud courses, official AWS certification exam prep, and practice exams",
            "Hands-on AWS Cloud Labs in live sandbox environments without risking personal credit cards",
            "Full access to AWS Cloud Quest role-playing games (Cloud Practitioner, Solutions Architect, Serverless, Security, Machine Learning)",
            "Milestone Reward: $10 AWS Cloud Credits upon earning 7 community badges",
            "Milestone Reward: $20 AWS Cloud Credits upon earning 14 community badges",
            "Milestone Reward: $100 AWS Certification Voucher upon earning 21 community badges (covers Cloud Practitioner exam in full)",
            "Global AWS Builder developer community access with peer solutions and product discussions",
        ],
        eligibility:
            "Enrolled college or university students verified via SheerID (Kasem Bundit University with active student email).",
        howToClaim: [
            "Navigate to the official AWS Student Rewards page at https://builder.aws.com/student-rewards.",
            "Click 'Get Started' and sign in or create your free AWS Builder ID (no credit card required).",
            "Complete the SheerID verification form: select 'Kasem Bundit University', enter your name, and your KBU student email (uxxxxxxxxxxxx@ms.kbu.ac.th).",
            "If verification requires confirming your student email, open your KBU Outlook mail at https://outlook.cloud.microsoft/mail/ using your Microsoft Teams password.",
            "Complete your Builder Center profile (upload a profile photo and short bio) to instantly activate your 1-Year Free AWS Skill Builder Annual Subscription.",
            "Engage in community questions and quests to earn badges that unlock your $10 & $20 AWS credits and $100 certification voucher.",
        ],
        officialUrl: "https://builder.aws.com/student-rewards",
        iconName: "aws",
    },
    {
        id: "jetbrains-student-pack",
        title: "JetBrains Educational License",
        provider: "JetBrains",
        categories: ["Developer Tools", "Learning & Productivity"],
        tagline: "Free access to all professional IDEs (IntelliJ, PyCharm, WebStorm, CLion).",
        description:
            "Get the full, unrestricted versions of the world's most powerful desktop developer tools for Java, Python, TypeScript/JavaScript, C++, and database administration.",
        badge: "Popular",
        valueBadge: "$249/year Value",
        postedDate: "2026-09-13",
        perks: [
            "IntelliJ IDEA Ultimate (advanced Java, Spring, Kotlin framework support)",
            "PyCharm Professional (Django, Flask, Data Science, and Jupyter notebooks)",
            "WebStorm (cutting-edge IDE for modern JavaScript, TypeScript, React, Next.js)",
            "CLion (C and C++ IDE with CMake and debugger support)",
            "DataGrip (multi-engine database environment for SQL, PostgreSQL, MySQL)",
            "All renewals free every year as long as you remain a student",
        ],
        eligibility: "Active university student with valid .ac.th institutional email address.",
        howToClaim: [
            "Go to jetbrains.com/community/education/#students.",
            "Click 'Apply now' and choose 'University email address'.",
            "Enter your KBU email (uxxxxxxxxxxxx@ms.kbu.ac.th).",
            "Open https://outlook.cloud.microsoft/mail/ to click the activation email from JetBrains.",
            "Log into JetBrains Toolbox or individual IDEs using your JetBrains student account.",
        ],
        officialUrl: "https://www.jetbrains.com/community/education/#students",
        iconName: "code",
    },
    {
        id: "azure-for-students",
        title: "Microsoft Azure for Students",
        provider: "Microsoft",
        categories: ["AI & Cloud", "Developer Tools"],
        tagline: "$100 cloud credit plus 25+ free cloud developer services without a credit card.",
        description:
            "Build, deploy, and manage web applications, AI models, virtual machines, and SQL databases on Microsoft Azure cloud infrastructure.",
        badge: "Cloud",
        valueBadge: "$100 USD Credit",
        postedDate: "2026-09-13",
        perks: [
            "$100 USD in Azure credits valid for 12 months with annual renewal option",
            "No credit card required for student activation",
            "Free access to Azure App Services, Azure Functions, Cosmos DB, and Cognitive AI APIs",
            "Free Visual Studio Enterprise subscription and download",
            "Free learning modules on Microsoft Learn for certification preparation",
        ],
        eligibility: "University student aged 18+ with school email verification.",
        howToClaim: [
            "Go to azure.microsoft.com/free/students/.",
            "Click 'Start free' and sign in using your KBU Microsoft 365 account (uxxxxxxxxxxxx@ms.kbu.ac.th).",
            "Verify your academic status via university single sign-on authentication.",
            "Access your $100 credit immediately inside the Azure Portal.",
        ],
        officialUrl: "https://azure.microsoft.com/free/students/",
        iconName: "azure",
    },
    {
        id: "notion-education",
        title: "Notion for Education",
        provider: "Notion",
        categories: ["Learning & Productivity", "Developer Tools"],
        tagline: "Free Notion Plus plan for student notes, project management, and study wikis.",
        description:
            "Organize coursework, lecture notes, syllabus checklists, team projects, and personal portfolios with Notion's modern workspace.",
        badge: "Productivity",
        valueBadge: "$120/year Value",
        postedDate: "2026-09-13",
        perks: [
            "Free Notion Plus plan (normally $10/month)",
            "Unlimited file uploads and unlimited page history",
            "Invite up to 100 guest collaborators for group projects and study sessions",
            "Access to hundreds of academic templates for CS study planners, assignment trackers, and code snippets",
        ],
        eligibility: "Students with university domain email (@ms.kbu.ac.th).",
        howToClaim: [
            "Sign up or log into Notion using your personal account or student email.",
            "Go to Settings & Members > My Account and change your account email to uxxxxxxxxxxxx@ms.kbu.ac.th (or sign up directly with it).",
            "Go to Settings > Upgrade and scroll to 'Students and educators'.",
            "Click 'Get free education plan' to activate immediately.",
        ],
        officialUrl: "https://www.notion.so/product/notion-for-education",
        iconName: "notion",
    },
];

type StudentBenefitText = Pick<
    StudentBenefit,
    | "tagline"
    | "description"
    | "valueBadge"
    | "badge"
    | "pricingNote"
    | "restrictionsNote"
    | "perks"
    | "eligibility"
    | "howToClaim"
>;

// Thai copy for each benefit. Titles, providers, URLs and product names stay in English.
const thaiBenefitText: Record<string, StudentBenefitText> = {
    "github-student-pack": {
        tagline: "ชุดเครื่องมือนักพัฒนายอดนิยมที่สุดในโลก ใช้ได้ฟรีทั้งหมด",
        description: "เข้าถึงเครื่องมือนักพัฒนามาตรฐานอุตสาหกรรม บริการคลาวด์ฟรี โดเมนเนม และแหล่งเรียนรู้ ตลอดช่วงที่คุณเป็นนักศึกษา KBU",
        badge: "ต้องมี",
        valueBadge: "มูลค่ากว่า $200,000",
        perks: [
            "บัญชี GitHub Pro ฟรีตลอดช่วงที่เป็นนักศึกษา",
            "ผู้ช่วยเขียนโค้ด AI GitHub Copilot ฟรี",
            "โดเมนเนม (.me) ฟรีจาก Namecheap 1 ปี",
            "เครดิตคลาวด์ DigitalOcean $100 และเครดิต dyno ของ Heroku",
            "Termius SSH client ฟรี และระบบมอนิเตอร์ Datadog",
            "Canva Pro ฟรี 1 ปี และไลเซนส์ Bootstrap Studio",
        ],
        eligibility: "นักศึกษา KBU ที่ลงทะเบียนเรียนอยู่ และมีอีเมล @ms.kbu.ac.th ที่ใช้งานได้หรือบัตรนักศึกษาที่ยังไม่หมดอายุ",
        howToClaim: [
            "เข้าสู่ระบบบัญชี GitHub ส่วนตัวของคุณ (หรือสร้างบัญชีใหม่)",
            "ไปที่ GitHub Settings > Emails แล้วเพิ่มอีเมล KBU ของคุณ: uxxxxxxxxxxxx@ms.kbu.ac.th",
            "เปิดกล่องจดหมาย Outlook ที่ https://outlook.cloud.microsoft/mail/ แล้วคลิกลิงก์ยืนยันที่ GitHub ส่งมา",
            "ปิด VPN ก่อน เพื่อให้ GitHub ตรวจสอบตำแหน่งที่ตั้งของคุณได้ถูกต้อง",
            "ไปที่ education.github.com/pack แล้วคลิก 'Sign up for Student Developer Pack'",
            "เลือก 'Kasem Bundit University' เลือกอีเมล @ms.kbu.ac.th ที่ยืนยันแล้ว และถ่ายรูปบัตรนักศึกษาให้ชัดเจน",
            "โดยปกติจะได้รับอีเมลแจ้งผลการอนุมัติภายใน 24–72 ชั่วโมง",
        ],
    },
    "google-ai-plus": {
        tagline: "ใช้ฟรี 12 เดือน พร้อมพื้นที่คลาวด์ 400 GB และสิทธิ์ใช้ Gemini AI ขั้นสูง",
        description:
            "แพ็กเกจ Google AI Plus สำหรับนักศึกษา จ่าย 0 บาท/เดือน นาน 12 เดือน (จากปกติ 189 บาท/เดือน) ได้พื้นที่เก็บข้อมูลรวม 400 GB สำหรับ Photos, Drive และ Gmail พร้อมโมเดล Gemini Flash Thinking และเครื่องมือ AI สร้างสรรค์ขั้นสูงของ Google",
        badge: "ฟรี 12 เดือน",
        valueBadge: "0 บาท/เดือน",
        pricingNote: "0 บาทต่อเดือน นาน 12 เดือน จากปกติ 189 บาท/เดือน (หลังครบ 12 เดือนคิด 189 บาท/เดือน)",
        restrictionsNote: "อาจมีข้อจำกัดด้านอายุ ภาษาที่รองรับ ความต้องการของระบบ จำนวนการใช้งานฟีเจอร์ต่อครั้ง และข้อจำกัดอื่น ๆ",
        perks: [
            "แอป Gemini: ขีดจำกัดการใช้งานสูงขึ้น 2 เท่าเมื่อเทียบกับการไม่มีแพ็กเกจ Google AI พร้อมสิทธิ์ใช้โมเดล Flash Thinking",
            "พื้นที่เก็บข้อมูล: รวม 400 GB สำหรับ Google Photos, Drive และ Gmail",
            "Google Flow: ใช้สตูดิโอ AI สร้างสรรค์ได้มากขึ้น เพื่อสร้างฉากและเรื่องราวแบบภาพยนตร์ด้วยโมเดล generative ขั้นสูงของ Google",
            "Google Search: ใช้ Nano Banana ใน Search ได้มากขึ้น",
            "Gemini ใน Gmail: ใช้ Gemini ได้โดยตรงใน Gmail",
            "Gemini Notebook: ใช้ผู้ช่วยค้นคว้าได้มากขึ้น พร้อม Audio & Video Overviews แบบทดสอบ และอื่น ๆ",
            "Google Flow Music: ใช้สตูดิโอสร้างเพลงด้วย AI ได้มากขึ้น",
        ],
        eligibility: "นักศึกษามหาวิทยาลัยที่ลงทะเบียนเรียนอยู่และผ่านการยืนยันสถานะนักศึกษา",
        howToClaim: [
            "ไปที่หน้าข้อเสนอ Google AI สำหรับนักศึกษาที่ https://one.google.com/ai-student",
            "เข้าสู่ระบบด้วยบัญชี Google ของคุณ",
            "ยืนยันสถานะนักศึกษา (เลือก Kasem Bundit University แล้วแนบหลักฐานการเป็นนักศึกษา หรือกรอกอีเมล @ms.kbu.ac.th เมื่อระบบขอ)",
            "หากต้องยืนยันผ่านอีเมลมหาวิทยาลัย ให้เข้า Outlook ของ KBU ที่ https://outlook.cloud.microsoft/mail/ ด้วยรหัสผ่าน Microsoft Teams ของคุณ",
            "เปิดใช้งาน Google AI Plus ฟรี 12 เดือน (0 บาท/เดือน) แล้วใช้พื้นที่ 400 GB และขีดจำกัด Gemini AI ที่เพิ่มขึ้นได้ทันที",
        ],
    },
    "figma-education": {
        tagline: "แพ็กเกจ Figma Professional ฟรี สำหรับออกแบบ UI/UX และทำงานร่วมกันเป็นทีม",
        description:
            "ออกแบบหน้าจอ ไวร์เฟรม และโปรโตไทป์แบบโต้ตอบได้ พร้อมทำงานร่วมกับเพื่อนร่วมชั้นและทีมออกแบบแบบเรียลไทม์โดยไม่มีข้อจำกัด",
        badge: "ดีไซน์",
        valueBadge: "มูลค่า $180/ปี",
        perks: [
            "แพ็กเกจ Figma Professional ฟรี (โปรเจกต์ไม่จำกัด ประวัติเวอร์ชันไม่จำกัด)",
            "ไวต์บอร์ด FigJam ฟรี สำหรับระดมความคิด วางแผนสปรินต์ และวาดไดอะแกรมสถาปัตยกรรม",
            "ใช้ Dev Mode ส่งต่องานระหว่างนักออกแบบกับนักพัฒนาได้อย่างราบรื่น",
            "ไลบรารีและดีไซน์ซิสเต็มที่แชร์ในทีม สำหรับงานกลุ่ม",
        ],
        eligibility: "นักศึกษาระดับอุดมศึกษาที่ลงทะเบียนเรียนอยู่ที่มหาวิทยาลัยเกษมบัณฑิต",
        howToClaim: [
            "สร้างบัญชีหรือเข้าสู่ระบบ Figma",
            "ไปที่ figma.com/education/apply",
            "เลือก 'Student' แล้วกรอก Kasem Bundit University เป็นสถาบันการศึกษา",
            "กรอกอีเมลนักศึกษา KBU (uxxxxxxxxxxxx@ms.kbu.ac.th) และส่งหลักฐานการเป็นนักศึกษา",
            "โดยทั่วไปจะยืนยันได้ทันทีเมื่อยืนยันความเป็นเจ้าของอีเมลแล้ว",
        ],
    },
    "aws-student-rewards": {
        tagline: "AWS Skill Builder ฟรี 1 ปี เครดิต AWS $30 และบัตรกำนัลสอบใบรับรองมูลค่า $100",
        description:
            "สมัคร AWS Builder Center เพื่อรับ AWS Skill Builder Annual Subscription ฟรีเต็ม 1 ปี (ปกติ $299/ปี) เข้าถึงคอร์สกว่า 900 คอร์ส แล็บคลาวด์แบบลงมือจริง และรับรางวัลตามเป้าหมาย ได้แก่ เครดิต AWS $30 และบัตรกำนัลสอบใบรับรองมูลค่า $100",
        badge: "ฟรี 1 ปี",
        valueBadge: "มูลค่ากว่า $399",
        pricingNote: "ฟรี 100% สำหรับนักศึกษาที่ยืนยันตัวตนผ่าน SheerID ไม่ต้องใช้บัตรเครดิตในทุกขั้นตอน",
        perks: [
            "AWS Skill Builder Annual Subscription ฟรี 1 ปี (ปกติมูลค่า $299/ปี)",
            "คอร์สคลาวด์ออนดีมานด์กว่า 900 คอร์ส พร้อมเนื้อหาเตรียมสอบใบรับรอง AWS อย่างเป็นทางการและข้อสอบฝึกหัด",
            "แล็บ AWS Cloud แบบลงมือจริงในสภาพแวดล้อม sandbox โดยไม่ต้องเสี่ยงใช้บัตรเครดิตส่วนตัว",
            "เล่นเกมสวมบทบาท AWS Cloud Quest ได้ครบทุกชุด (Cloud Practitioner, Solutions Architect, Serverless, Security, Machine Learning)",
            "รางวัลตามเป้าหมาย: เครดิต AWS Cloud $10 เมื่อได้ community badge ครบ 7 อัน",
            "รางวัลตามเป้าหมาย: เครดิต AWS Cloud $20 เมื่อได้ community badge ครบ 14 อัน",
            "รางวัลตามเป้าหมาย: บัตรกำนัลสอบใบรับรอง AWS มูลค่า $100 เมื่อได้ community badge ครบ 21 อัน (ครอบคลุมค่าสอบ Cloud Practitioner ทั้งหมด)",
            "เข้าร่วมชุมชนนักพัฒนา AWS Builder ทั่วโลก แลกเปลี่ยนวิธีแก้ปัญหาและพูดคุยเรื่องผลิตภัณฑ์กับนักพัฒนาคนอื่น",
        ],
        eligibility:
            "นักศึกษาระดับวิทยาลัยหรือมหาวิทยาลัยที่ลงทะเบียนเรียนอยู่ และยืนยันตัวตนผ่าน SheerID (มหาวิทยาลัยเกษมบัณฑิต พร้อมอีเมลนักศึกษาที่ใช้งานได้)",
        howToClaim: [
            "ไปที่หน้า AWS Student Rewards ที่ https://builder.aws.com/student-rewards",
            "คลิก 'Get Started' แล้วเข้าสู่ระบบหรือสร้าง AWS Builder ID ฟรี (ไม่ต้องใช้บัตรเครดิต)",
            "กรอกแบบฟอร์มยืนยันตัวตนของ SheerID: เลือก 'Kasem Bundit University' กรอกชื่อ และอีเมลนักศึกษา KBU (uxxxxxxxxxxxx@ms.kbu.ac.th)",
            "หากต้องยืนยันอีเมลนักศึกษา ให้เปิด Outlook ของ KBU ที่ https://outlook.cloud.microsoft/mail/ ด้วยรหัสผ่าน Microsoft Teams ของคุณ",
            "กรอกโปรไฟล์ Builder Center ให้ครบ (อัปโหลดรูปโปรไฟล์และประวัติสั้น ๆ) เพื่อเปิดใช้ AWS Skill Builder Annual Subscription ฟรี 1 ปีทันที",
            "ร่วมตอบคำถามและทำภารกิจในชุมชนเพื่อสะสม badge ปลดล็อกเครดิต AWS $10 และ $20 และบัตรกำนัลสอบใบรับรอง $100",
        ],
    },
    "jetbrains-student-pack": {
        tagline: "ใช้ IDE ระดับมืออาชีพได้ทุกตัวฟรี (IntelliJ, PyCharm, WebStorm, CLion)",
        description:
            "ใช้เครื่องมือนักพัฒนาบนเดสก์ท็อปที่ทรงพลังที่สุดในโลกแบบเต็มเวอร์ชันไม่มีข้อจำกัด สำหรับ Java, Python, TypeScript/JavaScript, C++ และการจัดการฐานข้อมูล",
        badge: "ยอดนิยม",
        valueBadge: "มูลค่า $249/ปี",
        perks: [
            "IntelliJ IDEA Ultimate (รองรับ Java, Spring และ Kotlin ขั้นสูง)",
            "PyCharm Professional (Django, Flask, Data Science และ Jupyter notebooks)",
            "WebStorm (IDE สำหรับ JavaScript, TypeScript, React และ Next.js ยุคใหม่)",
            "CLion (IDE สำหรับ C และ C++ รองรับ CMake และดีบักเกอร์)",
            "DataGrip (เครื่องมือฐานข้อมูลหลายเอนจินสำหรับ SQL, PostgreSQL, MySQL)",
            "ต่ออายุฟรีทุกปีตราบใดที่ยังเป็นนักศึกษา",
        ],
        eligibility: "นักศึกษามหาวิทยาลัยที่มีอีเมลสถาบัน .ac.th ที่ใช้งานได้",
        howToClaim: [
            "ไปที่ jetbrains.com/community/education/#students",
            "คลิก 'Apply now' แล้วเลือก 'University email address'",
            "กรอกอีเมล KBU ของคุณ (uxxxxxxxxxxxx@ms.kbu.ac.th)",
            "เปิด https://outlook.cloud.microsoft/mail/ แล้วคลิกลิงก์ในอีเมลเปิดใช้งานจาก JetBrains",
            "เข้าสู่ระบบ JetBrains Toolbox หรือ IDE แต่ละตัวด้วยบัญชีนักศึกษา JetBrains ของคุณ",
        ],
    },
    "azure-for-students": {
        tagline: "เครดิตคลาวด์ $100 และบริการคลาวด์ฟรีกว่า 25 รายการ โดยไม่ต้องใช้บัตรเครดิต",
        description:
            "สร้าง ดีพลอย และจัดการเว็บแอปพลิเคชัน โมเดล AI เครื่องเสมือน และฐานข้อมูล SQL บนโครงสร้างพื้นฐานคลาวด์ Microsoft Azure",
        badge: "คลาวด์",
        valueBadge: "เครดิต $100",
        perks: [
            "เครดิต Azure $100 ใช้ได้ 12 เดือน และต่ออายุได้ทุกปี",
            "เปิดใช้งานสำหรับนักศึกษาได้โดยไม่ต้องใช้บัตรเครดิต",
            "ใช้ Azure App Services, Azure Functions, Cosmos DB และ Cognitive AI APIs ได้ฟรี",
            "Visual Studio Enterprise ฟรี พร้อมดาวน์โหลด",
            "บทเรียนฟรีบน Microsoft Learn สำหรับเตรียมสอบใบรับรอง",
        ],
        eligibility: "นักศึกษามหาวิทยาลัยอายุ 18 ปีขึ้นไป ที่ยืนยันตัวตนด้วยอีเมลสถาบัน",
        howToClaim: [
            "ไปที่ azure.microsoft.com/free/students/",
            "คลิก 'Start free' แล้วเข้าสู่ระบบด้วยบัญชี Microsoft 365 ของ KBU (uxxxxxxxxxxxx@ms.kbu.ac.th)",
            "ยืนยันสถานะนักศึกษาผ่านระบบ single sign-on ของมหาวิทยาลัย",
            "ใช้เครดิต $100 ได้ทันทีใน Azure Portal",
        ],
    },
    "notion-education": {
        tagline: "แพ็กเกจ Notion Plus ฟรี สำหรับจดเลกเชอร์ จัดการโปรเจกต์ และทำวิกิสรุปบทเรียน",
        description:
            "จัดระเบียบงานรายวิชา โน้ตเลกเชอร์ เช็กลิสต์ตามประมวลรายวิชา โปรเจกต์กลุ่ม และพอร์ตโฟลิโอส่วนตัว ด้วยพื้นที่ทำงานของ Notion",
        badge: "เพิ่มประสิทธิภาพ",
        valueBadge: "มูลค่า $120/ปี",
        perks: [
            "แพ็กเกจ Notion Plus ฟรี (ปกติ $10/เดือน)",
            "อัปโหลดไฟล์ได้ไม่จำกัด และดูประวัติหน้าได้ไม่จำกัด",
            "เชิญผู้ร่วมงานแบบ guest ได้สูงสุด 100 คน สำหรับงานกลุ่มและการติวหนังสือ",
            "เทมเพลตด้านการเรียนหลายร้อยแบบ เช่น แพลนเนอร์การเรียน CS ตัวติดตามงานที่ได้รับมอบหมาย และคลังโค้ด",
        ],
        eligibility: "นักศึกษาที่มีอีเมลโดเมนมหาวิทยาลัย (@ms.kbu.ac.th)",
        howToClaim: [
            "สมัครหรือเข้าสู่ระบบ Notion ด้วยบัญชีส่วนตัวหรืออีเมลนักศึกษา",
            "ไปที่ Settings & Members > My Account แล้วเปลี่ยนอีเมลบัญชีเป็น uxxxxxxxxxxxx@ms.kbu.ac.th (หรือสมัครด้วยอีเมลนี้ตั้งแต่แรก)",
            "ไปที่ Settings > Upgrade แล้วเลื่อนลงไปที่ 'Students and educators'",
            "คลิก 'Get free education plan' เพื่อเปิดใช้งานทันที",
        ],
    },
};

const thaiEmailGuideText: Pick<StudentEmailGuideData, "description" | "steps" | "tips"> = {
    description:
        "นักศึกษา KBU ทุกคนที่ลงทะเบียนเรียนจะได้รับบัญชีอีเมล Microsoft 365 สำหรับการศึกษา อีเมลนี้คือกุญแจสำคัญในการรับเครื่องมือนักพัฒนา เครดิตคลาวด์ สมาชิกบริการ AI และไลเซนส์ซอฟต์แวร์ฟรีมูลค่าหลายพันดอลลาร์",
    steps: [
        {
            stepNumber: "01",
            title: "เปิด Outlook บนคลาวด์",
            detail: "ไปที่ https://outlook.cloud.microsoft/mail/ หรือ portal.office.com ด้วยเบราว์เซอร์ใดก็ได้",
        },
        {
            stepNumber: "02",
            title: "กรอกอีเมล KBU ของคุณ",
            detail: "กรอกอีเมลนักศึกษาในรูปแบบ u[รหัสนักศึกษา 12 หลัก]@ms.kbu.ac.th (ตัวอย่าง: u661305001234@ms.kbu.ac.th)",
        },
        {
            stepNumber: "03",
            title: "ใช้รหัสผ่าน Microsoft Teams",
            detail: "กรอกรหัสผ่าน ซึ่งเป็นรหัสเดียวกับที่คุณใช้เข้า Microsoft Teams สำหรับเรียนในมหาวิทยาลัย",
        },
        {
            stepNumber: "04",
            title: "ตรวจกล่องจดหมายและลิงก์ยืนยัน",
            detail: "เมื่อสมัครแพ็กเกจนักพัฒนา (GitHub, Figma, AWS, JetBrains) ลิงก์และรหัสยืนยันจะถูกส่งมาที่กล่องจดหมาย Outlook นี้",
        },
    ],
    tips: [
        "ตรวจทั้งแท็บ 'Focused' และ 'Other' รวมถึงโฟลเดอร์ 'Junk' เพื่อหาอีเมลยืนยันเสมอ",
        "รักษาอีเมลมหาวิทยาลัยให้ใช้งานได้ตลอดช่วงที่ศึกษา เพื่อให้ไลเซนส์ต่ออายุอัตโนมัติทุกปี",
        "หากเข้าสู่ระบบไม่ได้หรือต้องการรีเซ็ตรหัสผ่าน ติดต่อสำนักคอมพิวเตอร์และเทคโนโลยี KBU (CTC) ทาง LINE Official: @comcenter หรือที่จุดบริการในมหาวิทยาลัย",
    ],
};

export function getStudentBenefits(locale: Locale): StudentBenefit[] {
    if (locale === "en") return studentBenefits;
    return studentBenefits.map((benefit) => ({ ...benefit, ...thaiBenefitText[benefit.id] }));
}

export function getStudentEmailGuide(locale: Locale): StudentEmailGuideData {
    return locale === "en" ? studentEmailGuide : { ...studentEmailGuide, ...thaiEmailGuideText };
}

/** Formats an ISO date for display; Thai uses the Buddhist calendar year (13 กันยายน 2569). */
export function formatBenefitDate(isoDate: string, locale: Locale): string {
    return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${isoDate}T00:00:00Z`));
}
