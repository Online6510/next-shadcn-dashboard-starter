# Wanderly — Монгол орноор аялъя

## V4 Atlas experience (feature branch)

Шинэ dark-navy/lime дизайн, mobile bottom navigation, `/map` интерактив газрын зураг, хүссэн цэг/байршлыг шууд аялалд хадгалах боломж нэмэгдсэн. Тогтмол 16 газрын жагсаалт нь зөвхөн санал; дурын координаттай газрыг төлөвлөн хадгалж болно.

**API тохиргооны нөхцөл:** Map дээр дурын цэг тавих нь Geoapify key-гүй ажиллана. Харин дэлхийн хэмжээнд нэрээр хайх болон замын бодит маршрут тооцоход `GEOAPIFY_API_KEY` шаардлагатай. Нэвтрэлттэй бүрэн end-to-end болон live AI inference баталгаажаагүй тул branch нь Preview/Draft хэвээр байна. [V4 дэлгэрэнгүй заавар](docs/V4_ATLAS_IMPLEMENTATION.md).


Wanderly бол Монголын аяллыг төлөвлөх, зардал хянах, дурсамж/зураг хадгалах, AI-аар аяллын нэмэлт санал авах **Next.js 16** веб апп.

## Одоогийн production architecture (Supabase branch)

- **Supabase Auth:** Имэйл/нууц үгийн бүртгэл, нэвтрэлт. Баталгаажуулах имэйл болон redirect URL нь Supabase dashboard-ийн Auth тохиргооноос хамаарна.
- **Supabase PostgreSQL:** Аялал, даалгавар, зардал, дурсамжийг хэрэглэгч тус бүрт хадгалах JSONB document + revision.
- **RLS:** Хэрэглэгч зөвхөн өөрийн аяллыг уншиж/үүсгэж/засаж/устгана. Service role key ашиглаагүй.
- **Supabase Storage:** Хэрэглэгчийн ID-аар тусгаарлагдсан private `wanderly-journal` bucket, WebP upload, authenticated download route.
- **Vercel AI Gateway:** `google/gemini-2.5-flash-lite` загварын сервер талаас өгдөг AI аяллын санал. 24 цагт 5 хүсэлт/хэрэглэгч; AI хариу бодит үнэ эсвэл замын баталгаатай мэдээлэл биш.
- **V3 UI/UX:** Cinematic Home, Explore, Trip Workspace, Budget, scrapbook Journal, гурван өнгөний theme.

## Local run

Node.js 22.x, Bun 1.4+ хэрэгтэй.

```bash
bun install --frozen-lockfile
cp .env.example .env.local
# Supabase dashboard-аас project URL болон publishable key-г .env.local-д оруул.
bun run dev
```

AI-ийг локал орчинд ашиглах бол `AI_GATEWAY_API_KEY`-г **зөвхөн** хувийн `.env.local` файлд нэм. Vercel deployment-д OIDC token автоматаар өгөгдөх боломжтой тул provider API key-г source code-д бүү хадгал.

```bash
bun test
bun run typecheck
bun run lint
bun run build
```

- [Production setup, Auth redirect, deployment checklist](docs/deployment.md)
- [Supabase schema, RLS and private storage](docs/SUPABASE_SCHEMA.sql)
- [V3 UI visual QA](docs/UI_FIDELITY_REPORT.md)
- [V2 demo reference](docs/DEMO_SCRIPT_MN.md)

**Анхаар:** V2-ийн `.wanderly/trips.sqlite` local файл нь шинэ Supabase төсөлд автоматаар импортлогдохгүй. Хуучин өгөгдлөө устгаж болохгүй.

## Эх загвар

[Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) төслийн Next.js, TypeScript, Bun, shadcn/ui суурийг ашигласан. Эх загварын MIT лиценз, зохиогчийн мэдэгдэл [LICENSE](LICENSE)-д бий.


## Хуучин V2 хувилбарын түүхэн танилцуулга

**Бэлэн.** 16 газрын каталог, аяллын төлвийн шүүлт, зогсоол чирж эрэмбэлэх, саналын дараалал өөрчлөх, бодит зардлыг ангилах, цомог болон он дарааллын харагдац, олон зураг оруулах, браузераар хэвлэх.

**Нөхцөлтэй.** OpenStreetMap-ийн суурь зурагт сүлжээ шаардлагатай. Газрын зураг, зурагт тэмдэглэл, SQLite өгөгдөлтэй демог тогтвортой диск бүхий нэг хэрэглэгчийн серверт ажиллуулна. Vercel-ийн түр файлын систем дээр байршуулбал шинэчлэлтийн дараа локал өгөгдөл алдагдаж болно.

**Цаашдын ажил.** Олон хэрэглэгчийн эрх, хувийн объект хадгалалт, хуваалцах холбоос, замын чиглэл тооцох үйлчилгээ.

[Харагдацын шийдэл](docs/UI_UX_SPEC.md) · [Шалгалтын үр дүн](docs/QA_CHECKLIST.md) · [V2 дэлгэцийн зургууд](docs/screenshots/v2)

Энэ хувилбарын хөгжүүлэлт, тест болон дизайны ажилд OpenAI Codex ашигласан. Танилцуулгад оюутан өөрийн хийсэн болон шалгаж тайлбарлаж чадах хэсгээ тусад нь тодорхойлно.
