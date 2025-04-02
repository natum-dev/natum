import Typography from "@natum/natum-ui/Typography";
import { Container } from "@natum/natum-ui";
import classNames from "classnames";
import Link from "next/link";
import styles from "./page.module.scss";

export const metadata = {
  title: "Jonathan Ramlie - Frontend Engineer",
};

const Home = () => {
  return (
    <Container as="main" className={styles.main}>
      <div className={styles.summary}>
        <Typography variant="h2" className={styles.heading}>
          <span>
            Hey, I&apos;m <span className={styles.gradient}>Jonathan</span>
            &mdash;
          </span>
          <span>nice to meet you!</span>
        </Typography>
        <Typography
          variant="h5"
          color="secondary"
          className={styles.summary_text}
        >
          I bring designs to life by crafting intuitive, fast, and scalable web
          experiences that engage users and drive results.
        </Typography>
        <div className={classNames(styles.current_role, styles.summary_text)}>
          <Typography variant="body1" color="secondary" tag="span">
            Currently crafting seamless experiences at&nbsp;
          </Typography>
          <Typography
            tag="a"
            variant="body1"
            href="https://www.tiket.com"
            rel="noopener noreferrer"
            className={styles.link}
          >
            tiket.com
          </Typography>
          .
        </div>
        <Typography
          tag="div"
          className={classNames(styles.summary_text, styles.under_construction)}
          color="secondary"
        >
          My resume site is under construction. But hey, great time to improve
          your typing speed!
          <Typography color="primary">
            <Link href="/portfolio/typo-meter">
              Let&apos;s see how fast you type
            </Link>
            🚀
          </Typography>
        </Typography>
      </div>
    </Container>
  );
};

export default Home;
