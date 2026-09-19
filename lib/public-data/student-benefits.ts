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
    postedDate: string;
    description: string;
    steps: StudentEmailGuideStep[];
    tips: string[];
}

export const studentEmailGuide: StudentEmailGuideData = {
    portalName: "Microsoft 365 Outlook Webmail",
    portalUrl: "https://outlook.cloud.microsoft/mail/",
    formatExample: "uxxxxxxxxxxxx@ms.kbu.ac.th",
    postedDate: "13 September 2026",
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
            detail: "Input your student email address formatted as u[StudentID]@ms.kbu.ac.th (for example: u66130500123@ms.kbu.ac.th).",
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
        postedDate: "13 September 2026",
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
        postedDate: "13 September 2026",
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
        postedDate: "13 September 2026",
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
        postedDate: "13 September 2026",
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
        postedDate: "13 September 2026",
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
        postedDate: "13 September 2026",
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
        postedDate: "13 September 2026",
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
