import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} />

      <main className={styles.main}>
        <h1 className={styles.title}>
          欢迎来到您的 <span className="gradient-text">Next.js</span> 练习项目
        </h1>
        <p className={styles.subtitle}>
          这是一个为您专属打造的最简练而不失美感的初始化项目。<br />
          抛开繁杂的配置，立刻开始您的创意之旅。
        </p>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              开发文档 <span>-&gt;</span>
            </h2>
            <p>
              深入查阅 Next.js 的核心特性与详细 API，帮助您快速上手。
            </p>
          </a>

          <a
            href="https://nextjs.org/learn"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              学习资源 <span>-&gt;</span>
            </h2>
            <p>
              通过官方的交互式教程，掌握 React 和 Next.js 的最佳实践。
            </p>
          </a>

          <div className={styles.card}>
            <h2>
              开始编写代码 <span>-&gt;</span>
            </h2>
            <p>
              打开 <code>src/app/page.tsx</code> 并保存以查看您的实时更改。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
