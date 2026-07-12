import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBulletinPostById } from "@/lib/bulletin-actions";
import { parseVideoUrl } from "@/lib/video";
import ShareButton from "@/components/ShareButton";
import BulletinOwnerActions from "@/components/BulletinOwnerActions";
import AuthMenu from "@/components/AuthMenu";
import type { BulletinCategory } from "@/types/bulletin";

interface PageProps {
  params: Promise<{ id: string }>;
}

const BASE_URL = "https://www.burp.ink";

const CATEGORY_LABELS: Record<BulletinCategory, string> = {
  event: "Event",
  promotion: "Promotion / Offer",
  product: "Product",
  service: "Service",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getBulletinPostById(id);
  if (!post) return { title: "Not Found — BURP" };

  const description = post.description.slice(0, 160);
  const url = `${BASE_URL}/bulletin/${id}`;

  return {
    title: `${post.title} — BURP Bulletin`,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: "BURP — Berean Upper Room Platform",
      type: "article",
      locale: "en_US",
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
    twitter: {
      card: post.image_url ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.image_url ? [post.image_url] : undefined,
    },
    alternates: { canonical: url },
  };
}

export const revalidate = 0;

export default async function BulletinDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getBulletinPostById(id);
  if (!post) notFound();

  const video = parseVideoUrl(post.video_url);
  const eventDate = post.event_date ? new Date(post.event_date) : null;
  const isRetired = post.status !== "active";

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      {/* Top bar */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/bulletin"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140 flex items-center gap-1"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← Bulletin
          </Link>
          <div className="flex items-center gap-3">
            <BulletinOwnerActions postId={post.id} postUserId={post.user_id} />
            <ShareButton />
            <AuthMenu />
          </div>
        </div>
      </div>

      <article className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {isRetired && (
          <div className="mb-6 rounded-xl border border-stone-edge bg-parchment-soft px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-stone-mid">
            This post is no longer active
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-gold-soft/50 bg-gold-wash text-gold-deep"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {CATEGORY_LABELS[post.category] ?? post.category}
          </span>
          {post.price && (
            <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-stone-edge bg-white text-stone-mid">
              {post.price}
            </span>
          )}
        </div>

        {/* Title & poster */}
        <h1
          className="text-3xl sm:text-5xl font-bold text-ink leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h1>
        <div className="flex items-center gap-2 text-xs text-stone-light font-medium mb-8">
          <span>By {post.business_name || post.full_name}</span>
          <span>·</span>
          <span>
            {new Date(post.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Flyer */}
        {post.image_url && (
          <a href={post.image_url} target="_blank" rel="noopener noreferrer" className="block mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full rounded-2xl border border-stone-edge bg-parchment-soft object-contain max-h-[32rem]"
            />
          </a>
        )}

        {/* Video */}
        {video && (
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-stone-edge bg-ink mb-8"
            style={{ paddingBottom: "56.25%" }}
          >
            <iframe
              src={video.embedUrl}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}

        {/* Event / location meta */}
        {(eventDate || post.location) && (
          <div className="flex flex-col gap-2 mb-8 p-4 rounded-2xl bg-parchment-soft border border-stone-edge">
            {eventDate && (
              <div className="flex items-center gap-2 text-sm text-ink font-semibold">
                <span className="text-gold-deep">🗓</span>
                <span>
                  {eventDate.toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center gap-2 text-sm text-ink font-semibold">
                <span className="text-gold-deep">📍</span>
                <span>{post.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="text-sm sm:text-base text-stone-mid leading-relaxed whitespace-pre-wrap font-sans mb-8">
          {post.description}
        </div>

        {/* Link */}
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-info-earthen bg-blue-50/50 hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-info-earthen/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            <span>Visit Link</span>
          </a>
        )}

        {/* Contact */}
        <div className="rounded-2xl bg-ink text-vellum p-6">
          <h2
            className="text-[10px] font-bold tracking-widest uppercase text-gold mb-2"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Get in Touch
          </h2>
          <p className="text-xs text-vellum/70 mb-3">
            Reach {post.full_name} directly through their channel below.
          </p>
          <div className="bg-vellum/10 border border-vellum/15 rounded-xl p-4 text-sm font-mono break-all select-all">
            {post.contact_info}
          </div>
        </div>
      </article>

      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p
          className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          BURP Bulletin · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
