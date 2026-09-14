import React from 'react';
import { Metadata } from 'next';
import ArticleClient from '@/components/knowledge/ArticleClient';
import { getSupabase } from '@/utils/supabase/client';
import { FALLBACK_ARTICLES, DEFAULT_ARTICLE } from '@/lib/constants/knowledge-fallbacks';
import StructuredData from '@/components/seo/StructuredData';

// Cấu hình Metadata động cho SEO bài viết
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = getSupabase();
    
    let article = null;
    if (supabase) {
        try {
            const { data } = await supabase
                .from('knowledge_articles')
                .select('title_vi, category')
                .eq('slug', slug)
                .single();
            article = data;
        } catch (e) {}
    }

    const currentArticle = article || FALLBACK_ARTICLES[slug];

    if (!currentArticle) {
        return { title: 'Bài viết không tồn tại | ncsStat' };
    }

    const title = `${currentArticle.title_vi || 'Kiến thức Thống kê'} - ncsStat Academy`;
    const description = `Tìm hiểu chuyên sâu về ${currentArticle.title_vi} và các ứng dụng trong nghiên cứu khoa học. Tài liệu học thuật chuẩn quốc tế tại ncsStat.`;

    return {
        title,
        description,
        authors: [{ name: 'Le Phuc Hai' }],
        alternates: {
            canonical: `/knowledge/${slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://ncskit.org/knowledge/${slug}`,
            authors: ['Le Phuc Hai']
        }
    };
}

export async function generateStaticParams() {
    return [
        { slug: 'cronbach-alpha' }, 
        { slug: 'efa-factor-analysis' }, 
        { slug: 'regression-vif-multicollinearity' }
    ];
}

export const dynamicParams = true;

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    const supabase = getSupabase();
    let article = FALLBACK_ARTICLES[slug] || DEFAULT_ARTICLE;

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('knowledge_articles')
                .select('*')
                .eq('slug', slug)
                .single();
            
            if (data && !error) {
                article = data;
            }
        } catch (e) {
            console.error("Server fetch error - Using Fallback");
        }
    }

    const articleUrl = `https://ncskit.org/knowledge/${slug}`;
    const titleVi = article?.title_vi || 'Kiến thức Thống kê';
    
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": titleVi,
        "description": `Hướng dẫn chi tiết về ${titleVi} - Phân tích thống kê NCSKIT.org`,
        "author": {
            "@type": "Person",
            "name": "Le Phuc Hai"
        },
        "publisher": {
            "@type": "Organization",
            "name": "NCSKIT",
            "logo": {
                "@type": "ImageObject",
                "url": "https://ncskit.org/favicon.svg"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleUrl
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Trang chủ",
                "item": "https://ncskit.org"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Thư viện Kiến thức",
                "item": "https://ncskit.org/knowledge"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": titleVi,
                "item": articleUrl
            }
        ]
    };

    return (
        <>
            <StructuredData data={articleSchema} />
            <StructuredData data={breadcrumbSchema} />
            <ArticleClient 
                initialArticle={article} 
                fallbackArticles={FALLBACK_ARTICLES} 
                slug={slug} 
            />
        </>
    );
}
