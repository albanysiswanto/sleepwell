import os
import warnings

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import pandas as pd
import seaborn as sns
import streamlit as st

warnings.filterwarnings("ignore")
st.set_page_config(
    page_title="Sleep & Activity Dashboard",
    layout="wide",
    initial_sidebar_state="expanded"
)
st.markdown("""
<style>
    .stApp {
        background: linear-gradient(180deg, #F7FBF8 0%, #F2F7F3 100%);
    }

    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
        padding-left: 2.2rem;
        padding-right: 2.2rem;
        max-width: 1280px;
    }

    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    .hero-box {
        background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%);
        padding: 1.6rem 1.6rem 1.3rem 1.6rem;
        border-radius: 22px;
        color: white;
        box-shadow: 0 10px 28px rgba(45, 106, 79, 0.25);
        margin-bottom: 1.2rem;
    }

    .hero-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 0.25rem;
        line-height: 1.2;
    }

    .hero-subtitle {
        font-size: 1rem;
        opacity: 0.95;
        margin-bottom: 0.55rem;
        line-height: 1.6;
    }

    .hero-badge {
        display: inline-block;
        background: rgba(255,255,255,0.16);
        border: 1px solid rgba(255,255,255,0.22);
        border-radius: 999px;
        padding: 0.35rem 0.8rem;
        font-size: 0.86rem;
        margin-right: 0.45rem;
        margin-top: 0.35rem;
    }

    .metric-box {
        background: #FFFFFF;
        border: 1px solid #E3EEE7;
        border-radius: 18px;
        padding: 1rem 1rem 0.9rem 1rem;
        box-shadow: 0 4px 16px rgba(20, 50, 30, 0.05);
    }

    .metric-label {
        color: #5E7467;
        font-size: 0.92rem;
        margin-bottom: 0.2rem;
    }

    .metric-value {
        color: #1B4332;
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.1;
    }

    .metric-note {
        color: #7C8F84;
        font-size: 0.8rem;
        margin-top: 0.35rem;
    }

    .custom-card {
        background: #FFFFFF;
        border: 1px solid #E3EEE7;
        border-radius: 18px;
        padding: 1.2rem 1.2rem 1rem 1.2rem;
        box-shadow: 0 6px 20px rgba(24, 61, 44, 0.06);
        margin-bottom: 1rem;
    }

    .section-note {
        color: #5C6F65;
        font-size: 0.95rem;
        margin-top: -0.15rem;
        margin-bottom: 0.9rem;
        line-height: 1.6;
    }

    .insight-box {
        background: #F1F8F3;
        border-left: 5px solid #2D6A4F;
        border-radius: 14px;
        padding: 1rem 1.1rem;
        color: #1B4332;
        margin-top: 0.8rem;
        margin-bottom: 0.8rem;
        line-height: 1.6;
    }

    .warning-box {
        background: #FFF8E6;
        border-left: 5px solid #E9C46A;
        border-radius: 14px;
        padding: 1rem 1.1rem;
        color: #5C4610;
        margin-top: 0.8rem;
        margin-bottom: 0.8rem;
        line-height: 1.6;
    }

    .soft-divider {
        height: 1px;
        background: linear-gradient(to right, rgba(0,0,0,0), #DCE9E0, rgba(0,0,0,0));
        margin-top: 0.8rem;
        margin-bottom: 1.2rem;
    }

    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #F8FCF9 0%, #EEF6F0 100%);
        border-right: 1px solid #E3EEE7;
    }

    section[data-testid="stSidebar"] .block-container {
        padding-top: 1.5rem;
    }

    button[data-baseweb="tab"] {
        border-radius: 12px;
        padding: 0.55rem 1rem;
        background: #EDF5EF;
        border: 1px solid #E0EBE3;
        margin-right: 0.35rem;
    }

    button[data-baseweb="tab"][aria-selected="true"] {
        background: #2D6A4F !important;
        color: white !important;
        border: 1px solid #2D6A4F !important;
    }
</style>
""", unsafe_allow_html=True)

COLOR_PRIMARY = "#2D6A4F"
COLOR_DARK = "#1B4332"
COLOR_LIGHT = "#B7E4C7"
COLOR_BG = "#F8FBF9"
COLOR_ACCENT = "#E9C46A"
COLOR_SOFT = "#D8F3DC"

GREEN_PALETTE = [
    "#D8F3DC",
    "#B7E4C7",
    "#95D5B2",
    "#74C69D",
    "#40916C",
    "#2D6A4F"
]

sns.set_theme(style="whitegrid")

def style_axis(ax):
    ax.set_facecolor(COLOR_BG)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.45)


def render_metric(label, value, note):
    st.markdown(f"""
    <div class="metric-box">
        <div class="metric-label">{label}</div>
        <div class="metric-value">{value}</div>
        <div class="metric-note">{note}</div>
    </div>
    """, unsafe_allow_html=True)


def render_insight(text):
    st.markdown(f"""
    <div class="insight-box">
        {text}
    </div>
    """, unsafe_allow_html=True)


def render_warning(text):
    st.markdown(f"""
    <div class="warning-box">
        {text}
    </div>
    """, unsafe_allow_html=True)

@st.cache_data
def load_data():
    base_dir = os.path.dirname(__file__)

    path_fixed = os.path.join(base_dir, "df_final_clean_fixed.csv")
    path_final = os.path.join(base_dir, "df_final.csv")
    path_clean = os.path.join(base_dir, "df_final_clean.csv")

    if os.path.exists(path_fixed):
        data = pd.read_csv(path_fixed, keep_default_na=False)
    elif os.path.exists(path_final):
        data = pd.read_csv(path_final, keep_default_na=False)
    elif os.path.exists(path_clean):
        data = pd.read_csv(path_clean, keep_default_na=False)
    else:
        st.error(
            "File data tidak ditemukan. Letakkan df_final_clean_fixed.csv, df_final.csv, atau df_final_clean.csv di folder yang sama dengan app.py."
        )
        st.stop()

    return data


df = load_data()
required_columns = [
    "Id",
    "TotalSteps",
    "Calories",
    "VeryActiveMinutes",
    "SedentaryMinutes",
    "sleep_duration",
    "sleep_quality",
    "stress_level",
    "physical_activity",
    "BMI_category",
    "sleep_disorder"
]

missing_columns = [col for col in required_columns if col not in df.columns]

if missing_columns:
    st.error(f"Kolom berikut belum ditemukan di dataset: {missing_columns}")
    st.write("Kolom yang tersedia:")
    st.write(df.columns.tolist())
    st.stop()

with st.sidebar:
    st.markdown("## Sleep Dashboard")
    st.caption("Filter data interaktif")
    st.markdown("---")

    bmi_options = ["Semua"] + sorted(df["BMI_category"].dropna().astype(str).unique().tolist())
    selected_bmi = st.selectbox("Kategori BMI", bmi_options)

    disorder_options = ["Semua"] + sorted(df["sleep_disorder"].dropna().astype(str).unique().tolist())
    selected_disorder = st.selectbox("Gangguan Tidur", disorder_options)

    min_quality = int(df["sleep_quality"].min())
    max_quality = int(df["sleep_quality"].max())

    selected_quality = st.slider(
        "Rentang Kualitas Tidur",
        min_value=min_quality,
        max_value=max_quality,
        value=(min_quality, max_quality)
    )

    st.markdown("---")

filtered_df = df.copy()

if selected_bmi != "Semua":
    filtered_df = filtered_df[filtered_df["BMI_category"].astype(str) == selected_bmi]

if selected_disorder != "Semua":
    filtered_df = filtered_df[filtered_df["sleep_disorder"].astype(str) == selected_disorder]

filtered_df = filtered_df[
    (filtered_df["sleep_quality"] >= selected_quality[0]) &
    (filtered_df["sleep_quality"] <= selected_quality[1])
].copy()

with st.sidebar:
    st.info(f"**Jumlah data:** {filtered_df.shape[0]:,}")

    if not filtered_df.empty:
        st.info(f"**Jumlah pengguna:** {filtered_df['Id'].nunique():,}")
        st.info(f"**Rata-rata kualitas tidur:** {filtered_df['sleep_quality'].mean():.2f}")
    else:
        st.warning("Data kosong setelah filter diterapkan.")


st.markdown("""
<div class="hero-box">
    <div class="hero-title">Dashboard Analisis Aktivitas Fisik dan Pola Tidur</div>
    <div class="hero-subtitle">
        Dashboard ini menyajikan insight utama dari data aktivitas harian, tingkat stres, BMI,
        kualitas tidur, dan gangguan tidur pengguna selama April 2016.
    </div>
    <span class="hero-badge">Data Science Capstone</span>
    <span class="hero-badge">Periode April 2016</span>
    <span class="hero-badge">Sleep & Activity Analysis</span>
</div>
""", unsafe_allow_html=True)

if filtered_df.empty:
    st.warning("Tidak ada data yang sesuai dengan filter saat ini. Silakan ubah filter di sidebar.")
    st.stop()


avg_sleep_duration = filtered_df["sleep_duration"].mean()
avg_sleep_quality = filtered_df["sleep_quality"].mean()
avg_stress = filtered_df["stress_level"].mean()
avg_steps = filtered_df["TotalSteps"].mean()

col1, col2, col3, col4 = st.columns(4)

with col1:
    render_metric(
        "Rata-rata Durasi Tidur",
        f"{avg_sleep_duration:.2f}",
        "Jam tidur rata-rata pengguna"
    )

with col2:
    render_metric(
        "Rata-rata Kualitas Tidur",
        f"{avg_sleep_quality:.2f}",
        "Skor kualitas tidur rata-rata"
    )

with col3:
    render_metric(
        "Rata-rata Tingkat Stres",
        f"{avg_stress:.2f}",
        "Skor stres rata-rata pengguna"
    )

with col4:
    render_metric(
        "Rata-rata Jumlah Langkah",
        f"{avg_steps:,.0f}",
        "Langkah harian rata-rata"
    )

st.markdown('<div class="soft-divider"></div>', unsafe_allow_html=True)

tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "Overview",
    "Sleep Quality",
    "Stress & Health",
    "Key Drivers",
    "Data Readiness",
    "Final Insight"
])
with tab1:
    st.markdown('<div class="custom-card">', unsafe_allow_html=True)

    st.subheader("Overview Dataset April 2016")
    st.markdown(
        '<div class="section-note">Bagian ini memberikan gambaran awal mengenai distribusi gangguan tidur, kualitas tidur, dan sampel dataset akhir.</div>',
        unsafe_allow_html=True
    )

    c1, c2 = st.columns(2)

    with c1:
        disorder_count = (
            filtered_df["sleep_disorder"]
            .astype(str)
            .value_counts()
            .reset_index()
        )
        disorder_count.columns = ["sleep_disorder", "jumlah"]

        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        bars = ax.bar(
            disorder_count["sleep_disorder"],
            disorder_count["jumlah"],
            color=GREEN_PALETTE[:len(disorder_count)],
            edgecolor="white"
        )

        ax.set_title("Sebaran Gangguan Tidur Pengguna", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Gangguan Tidur")
        ax.set_ylabel("Jumlah Data")
        ax.tick_params(axis="x", rotation=15)

        max_value = disorder_count["jumlah"].max()

        for bar in bars:
            height = bar.get_height()
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                height + max_value * 0.01,
                f"{int(height):,}",
                ha="center",
                va="bottom",
                fontsize=9,
                color=COLOR_DARK
            )

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    with c2:
        quality_count = (
            filtered_df["sleep_quality"]
            .value_counts()
            .sort_index()
            .reset_index()
        )
        quality_count.columns = ["sleep_quality", "jumlah"]

        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        bars = ax.bar(
            quality_count["sleep_quality"].astype(str),
            quality_count["jumlah"],
            color=COLOR_PRIMARY,
            edgecolor="white",
            alpha=0.9
        )

        ax.set_title("Sebaran Kualitas Tidur Pengguna", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Kualitas Tidur")
        ax.set_ylabel("Jumlah Data")

        max_value = quality_count["jumlah"].max()

        for bar in bars:
            height = bar.get_height()
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                height + max_value * 0.01,
                f"{int(height):,}",
                ha="center",
                va="bottom",
                fontsize=9,
                color=COLOR_DARK
            )

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    render_insight(
        """
        Distribusi awal menunjukkan bagaimana kondisi gangguan tidur dan kualitas tidur tersebar pada dataset.
        Informasi ini penting karena target yang tidak seimbang dapat memengaruhi interpretasi analisis dan tahap pemodelan berikutnya.
        """
    )

    st.markdown("### Preview Dataset")
    st.dataframe(filtered_df.head(10), use_container_width=True)

    st.markdown('</div>', unsafe_allow_html=True)

with tab2:
    st.markdown('<div class="custom-card">', unsafe_allow_html=True)

    st.subheader("Aktivitas Fisik dan Kualitas Tidur")
    st.markdown(
        '<div class="section-note">Bagian ini menjawab pertanyaan mengenai hubungan aktivitas fisik harian dengan kualitas dan durasi tidur pengguna.</div>',
        unsafe_allow_html=True
    )

    c1, c2 = st.columns(2)

    with c1:
        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        sns.boxplot(
            data=filtered_df,
            x="sleep_quality",
            y="TotalSteps",
            color=COLOR_LIGHT,
            ax=ax
        )

        ax.set_title("Jumlah Langkah Berdasarkan Kualitas Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Kualitas Tidur")
        ax.set_ylabel("Jumlah Langkah")
        ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda y, _: f"{int(y):,}"))

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    with c2:
        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        sns.boxplot(
            data=filtered_df,
            x="sleep_quality",
            y="VeryActiveMinutes",
            color=COLOR_LIGHT,
            ax=ax
        )

        ax.set_title("Menit Aktivitas Intens Berdasarkan Kualitas Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Kualitas Tidur")
        ax.set_ylabel("Menit Aktivitas Intens")

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    render_insight(
        """
        Aktivitas fisik memiliki variasi pada setiap tingkat kualitas tidur, tetapi polanya tidak selalu linear.
        Beberapa pengguna dengan aktivitas tinggi tetap memiliki kualitas tidur yang berbeda-beda, sehingga aktivitas fisik perlu dilihat bersama variabel lain.
        """
    )

    st.markdown("---")

    st.subheader("Jumlah Langkah dan Durasi Tidur")

    fig, ax = plt.subplots(figsize=(10, 5.5))
    fig.patch.set_facecolor(COLOR_BG)
    style_axis(ax)

    sns.regplot(
        data=filtered_df,
        x="TotalSteps",
        y="sleep_duration",
        scatter_kws={"alpha": 0.45, "color": COLOR_LIGHT},
        line_kws={"color": COLOR_DARK, "linewidth": 2},
        ax=ax
    )

    ax.set_title("Hubungan Jumlah Langkah dan Durasi Tidur", color=COLOR_DARK, fontsize=13)
    ax.set_xlabel("Jumlah Langkah")
    ax.set_ylabel("Durasi Tidur")
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))

    st.pyplot(fig, use_container_width=True)
    plt.close(fig)

    render_insight(
        """
        Jumlah langkah harian tidak menunjukkan hubungan yang kuat dengan durasi tidur.
        Hal ini mengindikasikan bahwa durasi tidur kemungkinan dipengaruhi oleh kombinasi faktor lain seperti stres, kebiasaan tidur, dan kondisi kesehatan.
        """
    )

    st.markdown("---")

    st.subheader("Waktu Tidak Aktif dan Kualitas Tidur")

    fig, ax = plt.subplots(figsize=(10, 5.5))
    fig.patch.set_facecolor(COLOR_BG)
    style_axis(ax)

    sns.regplot(
        data=filtered_df,
        x="SedentaryMinutes",
        y="sleep_quality",
        scatter_kws={"alpha": 0.45, "color": COLOR_LIGHT},
        line_kws={"color": COLOR_DARK, "linewidth": 2},
        ax=ax
    )

    ax.set_title("Hubungan Waktu Tidak Aktif dan Kualitas Tidur", color=COLOR_DARK, fontsize=13)
    ax.set_xlabel("Waktu Tidak Aktif")
    ax.set_ylabel("Kualitas Tidur")

    st.pyplot(fig, use_container_width=True)
    plt.close(fig)

    render_insight(
        """
        Waktu tidak aktif cenderung memiliki hubungan negatif yang lemah terhadap kualitas tidur.
        Artinya, semakin tinggi waktu tidak aktif, kualitas tidur dapat sedikit menurun, meskipun pengaruhnya tidak sekuat tingkat stres.
        """
    )

    st.markdown('</div>', unsafe_allow_html=True)


with tab3:
    st.markdown('<div class="custom-card">', unsafe_allow_html=True)

    st.subheader("Tingkat Stres dan Pola Tidur")
    st.markdown(
        '<div class="section-note">Bagian ini menampilkan hubungan tingkat stres terhadap durasi tidur dan kualitas tidur pengguna.</div>',
        unsafe_allow_html=True
    )

    c1, c2 = st.columns(2)

    with c1:
        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        sns.regplot(
            data=filtered_df,
            x="stress_level",
            y="sleep_duration",
            scatter_kws={"alpha": 0.5, "color": COLOR_LIGHT},
            line_kws={"color": COLOR_DARK, "linewidth": 2},
            ax=ax
        )

        ax.set_title("Tingkat Stres dan Durasi Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Tingkat Stres")
        ax.set_ylabel("Durasi Tidur")

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    with c2:
        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        sns.regplot(
            data=filtered_df,
            x="stress_level",
            y="sleep_quality",
            scatter_kws={"alpha": 0.5, "color": COLOR_LIGHT},
            line_kws={"color": COLOR_DARK, "linewidth": 2},
            ax=ax
        )

        ax.set_title("Tingkat Stres dan Kualitas Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Tingkat Stres")
        ax.set_ylabel("Kualitas Tidur")

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    render_insight(
        """
        Tingkat stres menjadi salah satu faktor yang paling konsisten berkaitan dengan pola tidur.
        Semakin tinggi tingkat stres, durasi tidur dan kualitas tidur pengguna cenderung semakin menurun.
        """
    )

    st.markdown("---")

    st.subheader("BMI dan Gangguan Tidur")

    c1, c2 = st.columns(2)

    with c1:
        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        sns.countplot(
            data=filtered_df,
            x="BMI_category",
            hue="sleep_disorder",
            palette=GREEN_PALETTE,
            ax=ax
        )

        ax.set_title("Kategori BMI Berdasarkan Gangguan Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Kategori BMI")
        ax.set_ylabel("Jumlah Data")
        ax.legend(title="Gangguan Tidur")
        ax.tick_params(axis="x", rotation=15)

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    with c2:
        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        sns.boxplot(
            data=filtered_df,
            x="sleep_disorder",
            y="physical_activity",
            palette=GREEN_PALETTE,
            ax=ax
        )

        ax.set_title("Aktivitas Fisik Berdasarkan Gangguan Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Gangguan Tidur")
        ax.set_ylabel("Aktivitas Fisik")
        ax.tick_params(axis="x", rotation=15)

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    render_insight(
        """
        Kategori BMI menunjukkan pola yang relevan terhadap gangguan tidur.
        Pengguna dengan BMI normal cenderung lebih banyak berada pada kelompok tanpa gangguan tidur,
        sedangkan kategori overweight lebih banyak berkaitan dengan insomnia.
        """
    )

    st.markdown('</div>', unsafe_allow_html=True)


with tab4:
    st.markdown('<div class="custom-card">', unsafe_allow_html=True)

    st.subheader("Faktor Utama yang Berkaitan dengan Kualitas Tidur")
    st.markdown(
        '<div class="section-note">Bagian ini merangkum hubungan antarvariabel numerik dan faktor yang paling berkaitan dengan kualitas tidur.</div>',
        unsafe_allow_html=True
    )

    numeric_df = filtered_df.select_dtypes(include="number")

    if numeric_df.shape[1] >= 2:
        fig, ax = plt.subplots(figsize=(13, 8))
        fig.patch.set_facecolor(COLOR_BG)
        ax.set_facecolor(COLOR_BG)

        corr = numeric_df.corr()

        sns.heatmap(
            corr,
            annot=True,
            cmap="Greens",
            fmt=".2f",
            linewidths=0.5,
            ax=ax
        )

        ax.set_title("Korelasi Antarvariabel Numerik", color=COLOR_DARK, fontsize=14)

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

        render_insight(
            """
            Heatmap korelasi menunjukkan bahwa tingkat stres dan durasi tidur memiliki hubungan paling kuat dengan kualitas tidur.
            Stres berkorelasi negatif, sedangkan durasi tidur berkorelasi positif terhadap kualitas tidur.
            """
        )

        st.markdown("---")

        target_corr = (
            corr["sleep_quality"]
            .drop("sleep_quality")
            .sort_values(key=abs, ascending=False)
        )

        fig, ax = plt.subplots(figsize=(10, 6))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        colors = [COLOR_PRIMARY if value > 0 else COLOR_ACCENT for value in target_corr.values]

        bars = ax.barh(
            target_corr.index[::-1],
            target_corr.values[::-1],
            color=colors[::-1],
            edgecolor="white"
        )

        ax.axvline(0, color=COLOR_DARK, linewidth=0.9)
        ax.set_title("Faktor yang Paling Berkaitan dengan Kualitas Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Nilai Korelasi terhadap Kualitas Tidur")
        ax.set_ylabel("Variabel")
        ax.grid(axis="x", linestyle="--", alpha=0.45)

        for bar in bars:
            width = bar.get_width()
            offset = 0.02 if width >= 0 else -0.08
            ax.text(
                width + offset,
                bar.get_y() + bar.get_height() / 2,
                f"{width:.2f}",
                va="center",
                fontsize=9,
                color=COLOR_DARK
            )

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

        render_insight(
            """
            Faktor yang paling dominan berkaitan dengan kualitas tidur adalah tingkat stres dan durasi tidur.
            Aktivitas fisik tetap relevan, tetapi hubungannya terhadap kualitas tidur lebih lemah dibandingkan stres.
            """
        )
    else:
        st.warning("Jumlah variabel numerik tidak cukup untuk membuat analisis korelasi.")

    st.markdown('</div>', unsafe_allow_html=True)

with tab5:
    st.markdown('<div class="custom-card">', unsafe_allow_html=True)

    st.subheader("Kesiapan Dataset untuk Tahap Pemodelan")
    st.markdown(
        '<div class="section-note">Bagian ini menampilkan kondisi dataset akhir sebelum digunakan oleh tim AI Engineer.</div>',
        unsafe_allow_html=True
    )

    total_missing = int(filtered_df.isnull().sum().sum())
    total_duplicate = int(filtered_df.duplicated().sum())
    total_columns = filtered_df.shape[1]
    total_rows = filtered_df.shape[0]

    c1, c2, c3, c4 = st.columns(4)

    with c1:
        render_metric("Jumlah Baris", f"{total_rows:,}", "Data setelah filter")
    with c2:
        render_metric("Jumlah Kolom", f"{total_columns}", "Fitur dan target")
    with c3:
        render_metric("Missing Value", f"{total_missing}", "Total nilai kosong")
    with c4:
        render_metric("Duplikasi", f"{total_duplicate}", "Total baris duplikat")

    st.markdown("---")

    c1, c2 = st.columns(2)

    with c1:
        target_count = (
            filtered_df["sleep_disorder"]
            .astype(str)
            .value_counts()
            .reset_index()
        )
        target_count.columns = ["sleep_disorder", "jumlah"]

        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        bars = ax.bar(
            target_count["sleep_disorder"],
            target_count["jumlah"],
            color=GREEN_PALETTE[:len(target_count)],
            edgecolor="white"
        )

        ax.set_title("Target Klasifikasi: Gangguan Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Gangguan Tidur")
        ax.set_ylabel("Jumlah Data")
        ax.tick_params(axis="x", rotation=15)

        max_value = target_count["jumlah"].max()

        for bar in bars:
            height = bar.get_height()
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                height + max_value * 0.01,
                f"{int(height):,}",
                ha="center",
                va="bottom",
                fontsize=9,
                color=COLOR_DARK
            )

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    with c2:
        quality_count = (
            filtered_df["sleep_quality"]
            .value_counts()
            .sort_index()
            .reset_index()
        )
        quality_count.columns = ["sleep_quality", "jumlah"]

        fig, ax = plt.subplots(figsize=(8, 5))
        fig.patch.set_facecolor(COLOR_BG)
        style_axis(ax)

        bars = ax.bar(
            quality_count["sleep_quality"].astype(str),
            quality_count["jumlah"],
            color=COLOR_PRIMARY,
            edgecolor="white",
            alpha=0.9
        )

        ax.set_title("Target Regresi: Kualitas Tidur", color=COLOR_DARK, fontsize=13)
        ax.set_xlabel("Kualitas Tidur")
        ax.set_ylabel("Jumlah Data")

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    render_warning(
        """
        Dataset sudah cukup siap untuk tahap pemodelan awal, tetapi tim AI Engineer tetap perlu melakukan encoding,
        scaling, pemisahan fitur dan target, serta pengecekan data leakage sebelum training model.
        """
    )

    st.markdown("---")

    st.markdown("### Data Dictionary")

    data_dictionary = pd.DataFrame({
        "Kolom": [
            "Id",
            "day",
            "TotalSteps",
            "Calories",
            "VeryActiveMinutes",
            "SedentaryMinutes",
            "TotalMinutesAsleep",
            "TotalTimeInBed",
            "sleep_duration",
            "sleep_quality",
            "stress_level",
            "physical_activity",
            "BMI_category",
            "sleep_disorder"
        ],
        "Tipe Data": [
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Numerik",
            "Kategorikal",
            "Kategorikal"
        ],
        "Deskripsi": [
            "ID unik pengguna",
            "Hari pengamatan selama April 2016",
            "Jumlah langkah harian pengguna",
            "Jumlah kalori yang terbakar",
            "Durasi aktivitas intens pengguna",
            "Durasi waktu tidak aktif pengguna",
            "Total menit pengguna tertidur",
            "Total waktu pengguna berada di tempat tidur",
            "Durasi tidur pengguna",
            "Skor kualitas tidur pengguna",
            "Tingkat stres pengguna",
            "Tingkat aktivitas fisik pengguna",
            "Kategori BMI pengguna",
            "Jenis gangguan tidur pengguna"
        ],
        "Peran": [
            "Identitas",
            "Fitur waktu",
            "Fitur",
            "Fitur",
            "Fitur",
            "Fitur",
            "Fitur",
            "Fitur",
            "Fitur / target alternatif",
            "Target potensial",
            "Fitur",
            "Fitur",
            "Fitur",
            "Target potensial"
        ]
    })

    st.dataframe(data_dictionary, use_container_width=True)

    st.markdown("---")

    csv = filtered_df.to_csv(index=False).encode("utf-8")

    st.download_button(
        label="Download Dataset Terfilter",
        data=csv,
        file_name="filtered_sleep_activity_data.csv",
        mime="text/csv"
    )

    st.markdown('</div>', unsafe_allow_html=True)

with tab6:
    st.markdown('<div class="custom-card">', unsafe_allow_html=True)

    st.subheader("Kesimpulan Utama")

    render_insight(
        """
        Berdasarkan hasil analisis selama April 2016, kualitas tidur pengguna paling kuat berkaitan dengan tingkat stres dan durasi tidur.
        Semakin tinggi tingkat stres, durasi tidur dan kualitas tidur cenderung menurun. Sebaliknya, durasi tidur yang lebih panjang
        cenderung berkaitan dengan kualitas tidur yang lebih baik.
        """
    )

    render_insight(
        """
        Aktivitas fisik seperti jumlah langkah, menit aktivitas intens, dan kalori terbakar tetap relevan dalam analisis,
        tetapi hubungannya terhadap kualitas tidur tidak sekuat tingkat stres. Artinya, aktivitas fisik perlu dianalisis
        bersama faktor lain seperti stres, BMI, waktu tidak aktif, dan pola tidur.
        """
    )

    render_insight(
        """
        Kategori BMI menunjukkan pola tertentu terhadap gangguan tidur. Pengguna dengan BMI normal lebih banyak berada pada kelompok
        tanpa gangguan tidur, sedangkan pengguna overweight lebih banyak berkaitan dengan insomnia. Namun, hubungan ini tetap perlu
        dipahami sebagai pola data, bukan hubungan sebab-akibat langsung.
        """
    )

    st.markdown("### Rekomendasi untuk Tim AI Engineer")

    st.markdown("""
    - Gunakan `sleep_disorder` sebagai target klasifikasi atau `sleep_quality` sebagai target regresi.
    - Lakukan encoding pada variabel kategorikal seperti `BMI_category` dan `sleep_disorder`.
    - Lakukan scaling pada variabel numerik bila model yang digunakan sensitif terhadap skala.
    - Hindari data leakage dengan memastikan target tidak masuk ke dalam fitur training.
    - Jika target yang digunakan adalah `sleep_quality`, penggunaan `sleep_duration` perlu dipertimbangkan karena korelasinya sangat tinggi.
    - Perhatikan ketidakseimbangan kelas pada `sleep_disorder`, terutama jika kelas tertentu memiliki jumlah data jauh lebih sedikit.
    """)

    st.markdown('</div>', unsafe_allow_html=True)

st.markdown('<div class="soft-divider"></div>', unsafe_allow_html=True)
st.caption("Dashboard Capstone Data Science — Analisis Aktivitas Fisik dan Pola Tidur | Periode April 2016")