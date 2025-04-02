import Typography from "@jonathanramlie/neuron/Typography";
import { Container } from "@jonathanramlie/neuron";
import Link from "next/link";
import LinkedIn from "@/public/icons/linkedin-brands-solid.svg";
import Github from "@/public/icons/github-brands-solid.svg";
import Image from "next/image";
import styles from "./page.module.scss";

const Home = () => {
  return (
    <Container as="main" className={styles.main}>
      <div>
        <Typography variant="h2" className={styles.heading} color="info">
          Hi!
        </Typography>
        <Typography variant="h1" className={styles.heading}>
          I&apos;m Jonathan,
        </Typography>
        <div className={styles.jobtitle}>
          <Typography variant="h5">Front End Engineer</Typography>
          <Typography variant="body2" className={styles.alternate}>
            <span>DevTools Detective</span>
            <span>Pixel Perfection Specialist</span>
          </Typography>
        </div>
        <div className={styles.construction}>
          <Typography variant="h6">🚧 Website Under Construction 🚧</Typography>
          <Typography>
            You can check my&nbsp;
            <Link
              href="/portfolio/typo-meter"
              className={styles.portfolio_link}
            >
              Typo-Meter Portfolio
            </Link>
            &nbsp;in the meantime!
          </Typography>
        </div>
      </div>
      <div className={styles.socials}>
        <a href="https://www.linkedin.com/in/jonathanramlie/">
          <Image src={LinkedIn} alt="linkedin icon" width={36} height={36} />
        </a>
        <a href="https://github.com/jonathanramlie">
          <Image src={Github} alt="Github icon" width={36} height={36} />
        </a>
      </div>
    </Container>
  );
};

export default Home;
