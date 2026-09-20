import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { SITE } from "@/content/copy";
import { DEPARTMENTS, DEPARTMENT_BY_SLUG } from "@/content/departments";
import { DepartmentExperience } from "@/components/department/DepartmentExperience";

// Spelled out rather than PageProps<"/departments/[slug]">: that helper only knows a route after
// Next has regenerated its route types, and this file has to type-check before then too.
interface DepartmentPageProps {
  params: Promise<{ slug: string }>;
}

// Seven departments, all known at build time. Anything else is a 404, never a render on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: DepartmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const department = DEPARTMENT_BY_SLUG[slug];
  if (!department) return {};
  return {
    title: department.agentName,
    description: department.oneLiner,
    // A page's openGraph replaces the layout's whole object, so the shared fields are repeated here.
    alternates: { canonical: "./" },
    openGraph: {
      title: `${department.agentName} — ${SITE.name}`,
      description: department.oneLiner,
      type: "website",
      siteName: SITE.name,
      url: "./",
      // The file-based image only merges into the segment that owns it, so name it explicitly here.
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${department.agentName} — ${SITE.name}` }],
    },
    twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
  };
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const department = DEPARTMENT_BY_SLUG[slug];
  if (!department) notFound();

  // Every foundation component tints itself from these two variables.
  const accent = { "--accent": department.accent, "--accent-rgb": department.accentRgb } as CSSProperties;

  return (
    <div style={accent}>
      <main id="content">
        {/* Only the id crosses the boundary: the client bundle already carries the department's content. */}
        <DepartmentExperience departmentId={department.id} />
      </main>
    </div>
  );
}
