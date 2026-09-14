'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Clock, ArrowRight, TrendingUp, ShieldCheck, 
  Brain, FileSearch, LineChart, Hash, Zap, HelpCircle, Layers, Activity, Quote, BarChart3
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getStoredLocale, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { getSupabase } from '@/utils/supabase/client';

const supabase = getSupabase();

// --- FALLBACK DATA (To ensure Hub is NEVER empty) ---
const STATIC_ARTICLES = [
    {
        slug: 'cronbach-alpha',
        category: 'Preliminary Analysis',
        icon_name: 'Brain',
        title_vi: 'Cronbach\'s Alpha Masterclass: Từ Cơ bản đến Chuyên gia',
        title_en: 'Cronbach\'s Alpha Masterclass: From Basics to Expert'
    },
    {
        slug: 'technology-acceptance-model-tam',
        category: 'Research Models',
        icon_name: 'TrendingUp',
        title_vi: 'Mô hình Chấp nhận Công nghệ (TAM): Hướng dẫn Chuyên sâu',
        title_en: 'Technology Acceptance Model (TAM): The Ultimate Guide'
    },
    {
        slug: 'theory-of-planned-behavior-tpb',
        category: 'Behavioral Research',
        icon_name: 'Brain',
        title_vi: 'Thuyết Hành vi Dự định (TPB): Chìa khóa giải mã Ý định',
        title_en: 'Theory of Planned Behavior (TPB): Decoding Intentions'
    },
    {
        slug: 'servqual-service-quality-model',
        category: 'Marketing Research',
        icon_name: 'Layers',
        title_vi: 'Mô hình SERVQUAL: Đo lường Chất lượng Dịch vụ',
        title_en: 'SERVQUAL: Measuring Service Quality'
    },
    {
        slug: 'utaut-technology-adoption',
        category: 'Research Models',
        icon_name: 'Zap',
        title_vi: 'Thuyết Hợp nhất Chấp nhận Công nghệ (UTAUT)',
        title_en: 'UTAUT: Unified Technology Acceptance'
    },
    {
        slug: 'porter-five-forces-analysis',
        category: 'Market Strategy',
        icon_name: 'ShieldCheck',
        title_vi: 'Mô hình 5 Áp lực Cạnh tranh (Michael Porter)',
        title_en: 'Porter\'s Five Forces Analysis'
    },
    {
        slug: 'vrio-framework-strategy',
        category: 'Market Strategy',
        icon_name: 'Layers',
        title_vi: 'Khung VRIO: Đánh giá Nguồn lực nội tại',
        title_en: 'VRIO Framework: Assessing Internal Resources'
    },
    {
        slug: 'expectation-confirmation-theory-ect',
        category: 'Marketing Research',
        icon_name: 'BookOpen',
        title_vi: 'Thuyết Kỳ vọng - Xác nhận (ECT)',
        title_en: 'Expectation-Confirmation Theory (ECT)'
    },
    {
        slug: 'sor-model-marketing-behavior',
        category: 'Behavioral Research',
        icon_name: 'Zap',
        title_vi: 'Mô hình S-O-R: Kích thích - Cơ thể - Phản hồi',
        title_en: 'S-O-R Model: Stimulus-Organism-Response'
    },
    {
        slug: 'perceived-value-marketing-strategy',
        category: 'Marketing Research',
        icon_name: 'TrendingUp',
        title_vi: 'Mô hình Giá trị Cảm nhận (Perceived Value)',
        title_en: 'Perceived Value in Marketing Strategy'
    },
    {
        slug: 'tce-transaction-cost-economics-strategy',
        category: 'Advanced Research',
        icon_name: 'Hash',
        title_vi: 'Kinh tế học Chi phí Giao dịch (TCE)',
        title_en: 'Transaction Cost Economics (TCE)'
    },
    {
        slug: 'descriptive-statistics-interpretation',
        category: 'Preliminary Analysis',
        icon_name: 'BarChart3',
        title_vi: 'Thống kê mô tả: Nghệ thuật kể chuyện qua con số',
        title_en: 'Descriptive Statistics: The Art of Storytelling'
    },
    {
        slug: 'cfa-confirmatory-factor-analysis',
        category: 'Advanced Statistics',
        icon_name: 'ShieldCheck',
        title_vi: 'CFA: Chìa khóa vàng thẩm định thang đo',
        title_en: 'CFA: The Gold Standard for Validation'
    },
    {
        slug: 'efa-factor-analysis',
        category: 'Factor Analysis',
        icon_name: 'Layers',
        title_vi: 'Phân tích nhân tố khám phá (EFA): Khám phá cấu trúc ẩn',
        title_en: 'Exploratory Factor Analysis (EFA): Discovering Inner Structures'
    },
    {
        slug: 'regression-vif-multicollinearity',
        category: 'Impact Analysis',
        icon_name: 'LineChart',
        title_vi: 'Hồi quy đa biến và Đa cộng tuyến (VIF): Dự báo Tác động',
        title_en: 'Multiple Regression & VIF: Predicting the Future'
    },
    {
        slug: 'sem-cfa-structural-modeling',
        category: 'Structural Modeling',
        icon_name: 'Layers',
        title_vi: 'SEM & CFA: Đỉnh cao của Phân tích cấu trúc',
        title_en: 'SEM & CFA: Structural Modeling Masterclass'
    },
    {
        slug: 'independent-t-test-guide',
        category: 'Comparison Analysis',
        icon_name: 'Activity',
        title_vi: 'Independent T-test: So sánh các nhóm đối đầu',
        title_en: 'Independent T-test: Comparing Opposite Groups'
    },
    {
        slug: 'one-way-anova-post-hoc',
        category: 'Comparison Analysis',
        icon_name: 'Layers',
        title_vi: 'Phân tích ANOVA: So sánh Đa nhóm chuyên sâu',
        title_en: 'One-way ANOVA: Deep Multi-group Analysis'
    },
    {
        slug: 'pearson-correlation-analysis',
        category: 'Relationship Analysis',
        icon_name: 'Hash',
        title_vi: 'Tương quan Pearson: Bản đồ các mối liên kết',
        title_en: 'Pearson Correlation: The Connection Map'
    },
    {
        slug: 'chi-square-test-independence',
        category: 'Categorical Analysis',
        icon_name: 'Zap',
        title_vi: 'Kiểm định Chi-square: Liên kết dữ liệu định danh',
        title_en: 'Chi-square Test: Linking Categorical Data'
    },
    {
        slug: 'mediation-analysis-sobel-test',
        category: 'Advanced Analysis',
        icon_name: 'Brain',
        title_vi: 'Biến trung gian (Mediation): Giải mã cơ chế tác động',
        title_en: 'Mediation Analysis: Decoding Core Mechanisms'
    },
    {
        slug: 'data-cleaning-outliers-detection',
        category: 'Preliminary Analysis',
        icon_name: 'FileSearch',
        title_vi: 'Làm sạch dữ liệu & Outliers: Vệ sinh Khoa học',
        title_en: 'Data Cleaning & Outliers: Scientific Scrubbing'
    },
    {
        slug: 'signaling-theory-research',
        category: 'Market Strategy',
        icon_name: 'Zap',
        title_vi: 'Lý thuyết Tín hiệu (Signaling Theory): Khi Hành động lên tiếng',
        title_en: 'Signaling Theory: Actions Speak Louder Than Words'
    },
    {
        slug: 'common-method-bias-survey-research',
        category: 'Advanced Research',
        icon_name: 'ShieldCheck',
        title_vi: 'Common Method Bias (CMB): Kẻ hủy diệt âm thầm của nghiên cứu khảo sát',
        title_en: 'Common Method Bias (CMB): The Silent Assassin of Survey Research'
    },
    {
        slug: 'pls-sem-vs-cb-sem-selection',
        category: 'Advanced Statistics',
        icon_name: 'Zap',
        title_vi: 'PLS-SEM vs CB-SEM: Chọn đúng "vũ khí" cho bài báo quốc tế',
        title_en: 'PLS-SEM vs CB-SEM: Choosing the Right Weapon for International Journals'
    },
    {
        slug: 'writing-academic-results-apa',
        category: 'Academic Writing',
        icon_name: 'Quote',
        title_vi: 'Viết kết quả nghiên cứu chuẩn Q1: Biến con số thành câu chuyện học thuật',
        title_en: 'Writing Q1-Level Results: Turning Numbers into Academic Narratives'
    },
    {
        slug: 'interaction-effects-moderation',
        category: 'Impact Analysis',
        icon_name: 'Zap',
        title_vi: 'Biến tương tác & Điều tiết: Sự cộng hưởng của các nhân tố',
        title_en: 'Interaction & Moderation Effects: Factor Synergies'
    },
    {
        slug: 'manipulation-check-scenario',
        category: 'Research Design',
        icon_name: 'ShieldCheck',
        title_vi: 'Manipulation Check: Đảm bảo tính hợp lệ của kịch bản thực nghiệm',
        title_en: 'Manipulation Check: Validating Experimental Scenarios'
    },
    {
        slug: 'systematic-literature-review-slr',
        category: 'Research Design',
        icon_name: 'FileSearch',
        title_vi: 'SLR & Phân tích nội dung: Lược khảo tài liệu có hệ thống',
        title_en: 'SLR & Content Analysis: Systematic Literature Review'
    },
    {
        slug: 'qualitative-coding-expert-interview',
        category: 'Qualitative Research',
        icon_name: 'Brain',
        title_vi: 'Mã hóa định tính & Phỏng vấn chuyên gia: Hiệu chuẩn thang đo',
        title_en: 'Qualitative Coding & Expert Interviews: Scale Calibration'
    }
];

// Map icon name to Lucide components
const iconMap: Record<string, any> = {
  Brain: Brain,
  FileSearch: FileSearch,
  LineChart: LineChart,
  Hash: Hash,
  Zap: Zap,
  HelpCircle: HelpCircle,
  Layers: Layers,
  Activity: Activity,
  BookOpen: BookOpen,
  TrendingUp: TrendingUp,
  Quote: Quote,
  BarChart3: BarChart3,
  ShieldCheck: ShieldCheck
};

export default function KnowledgeBase() {
  const [locale, setLocale] = useState<Locale>('vi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<any[]>(STATIC_ARTICLES); // Init with fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLocale(getStoredLocale());
    fetchArticles();
    
    const handleLocaleChange = () => setLocale(getStoredLocale());
    window.addEventListener('localeChange', handleLocaleChange);
    return () => window.removeEventListener('localeChange', handleLocaleChange);
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
        if (!supabase) throw new Error("Supabase client is null");
        const { data, error } = await supabase
          .from('knowledge_articles')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (data && data.length > 0) {
            setArticles(data);
        } else {
            console.warn('Supabase Knowledge Hub empty - Using Fallback Data');
            setArticles(STATIC_ARTICLES);
        }
    } catch (err) {
        console.error('Supabase fetch failed - Using Fallback Data');
        setArticles(STATIC_ARTICLES);
    } finally {
        setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const title = locale === 'vi' ? (article.title_vi || '') : (article.title_en || '');
    const category = article.category || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const isVi = locale === 'vi';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <div className="container mx-auto px-6 mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full mb-6 border border-indigo-100 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] uppercase font-black tracking-widest">
                {isVi ? 'Kiến thức Chuyên sâu' : 'Expert Knowledge Hub'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.95]">
              {isVi ? 'Học viện Thống kê' : 'Statistics Academy'}
              <span className="text-indigo-600 inline-block ml-3">ncsStat.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              {isVi 
                ? 'Thư viện hướng dẫn phân tích dữ liệu chuyên nghiệp chuẩn Scopus/ISI.' 
                : 'Professional data analysis guides for Scopus/ISI requirements.'}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                placeholder={isVi ? "Tìm kiếm hướng dẫn..." : "Search guides..."}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 font-bold text-base focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all shadow-lg shadow-slate-200/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Dashboard Stats Bar */}
        <div className="container mx-auto px-6 max-w-7xl mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isVi ? 'Bài viết' : 'Articles'}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{articles.length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isVi ? 'Độ tin cậy' : 'Reliability'}</p>
                <p className="text-xl font-black text-slate-900 leading-none">100%</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isVi ? 'Lượt xem' : 'Views'}</p>
                <p className="text-xl font-black text-slate-900 leading-none">12.5K</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">{isVi ? 'Trạng thái' : 'Status'}</p>
                <p className="text-xl font-black text-white leading-none">Live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills - Professional Filter */}
        <div className="container mx-auto px-6 max-w-7xl mb-12">
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4">
                {['All', 'Preliminary Analysis', 'Factor Analysis', 'Structural Modeling', 'Comparison Analysis', 'Relationship Analysis', 'Advanced Statistics', 'Research Models', 'Market Strategy', 'Behavioral Research', 'Marketing Research', 'Impact Analysis', 'Academic Writing', 'Research Design', 'Qualitative Research'].map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                            selectedCategory === cat 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-600 hover:text-indigo-600'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Premium Article Feed Grid */}
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, aIdx) => {
                const Icon = iconMap[article.icon_name || 'Brain'] || Brain;
                const updatedAt = article.updated_at ? new Date(article.updated_at).toLocaleDateString(isVi ? 'vi-VN' : 'en-US') : '22/04/2026';

                return (
                  <Link 
                    key={article.slug} 
                    href={`/knowledge/${article.slug}`}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-bottom-8"
                    style={{ animationDelay: `${aIdx * 50}ms` }}
                  >
                    {/* Background Decorative Element */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-[3] group-hover:bg-indigo-50/50 transition-transform duration-1000"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:bg-indigo-600 group-hover:shadow-indigo-200 group-hover:rotate-6 transition-all duration-500">
                                <Icon className="w-8 h-8" />
                            </div>
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100">
                                {article.category}
                            </span>
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors leading-[1.1] tracking-tight">
                            {isVi ? article.title_vi : article.title_en}
                        </h3>
                        
                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{updatedAt}</span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                {isVi ? 'Đọc thêm' : 'Read Insight'}
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dotted border-slate-100 mt-12 shadow-inner">
              <HelpCircle className="w-20 h-20 text-slate-200 mx-auto mb-8 animate-bounce" />
              <p className="text-slate-400 font-black text-xl uppercase tracking-widest">
                {isVi ? 'Không tìm thấy dữ liệu' : 'Entry not found'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
