import styles from "./Button.module.scss";

export type ButtonProps = {
  exampleProps: string;
};

const Button = ({ exampleProps }: ButtonProps): JSX.Element => {
  return (
    <button className={styles.bg_red}>Example Button {exampleProps}</button>
  );
};

export default Button;
