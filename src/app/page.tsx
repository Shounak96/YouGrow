import { ProButton } from "@/components/ui/pro-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/site/Header";
import Image from "next/image";


export default async function Page() {
  const session = await auth();
  const dashHref = session?.user ? "/dashboard" : "/signup?next=/dashboard";

  return (
    <>
      <Header />
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="space-y-2">

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Grow smarter on YouTube.
          </h1>

          <p className="max-w-2xl text-gray-600">
            Analyze channel performance, generate thumbnail variants, and
            produce AI-powered content ideas - with a clean, modern UI.
          </p>

          <div className="mt-5 flex gap-3">
            <Link href="/signup?next=/dashboard">
              <ProButton>Get Started</ProButton>
            </Link>
            <Link href={dashHref}>
              <ProButton variant="secondary">View Dashboard</ProButton>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Channel Insights",
              desc: "Track connected channels, view idea trends, job performance, and content patterns - all from your own data.",
            },
            {
              title: "Smart Idea Generation",
              desc: "Queue AI-powered jobs to generate hooks, titles, and thumbnails - all running in the background.",
            },
            {
               title: "Creator Toolkit",
               desc: "AI-generated hooks, titles, and thumbnail text - to help creators move from idea to upload faster.",
            },
          ].map((x) => (
            <Card key={x.title}>
              <CardHeader>
                <CardTitle className="text-lg">{x.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                {x.desc}
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Big visual section */}
        <div className="mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <Image
              src="/landing-page.png"
              alt="YouGrow insights dashboard preview"
              width={1600}
              height={900}
              priority
              className="h-[520px] w-full object-cover sm:h-[650px] lg:h-[760px]"
            />
          </div>
        </div>

      </div>
    </main>
    </>
  );
}
