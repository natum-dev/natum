import { ReactNode } from "react";
import Typography from "@jonathanramlie/neuron/Typography";
import styles from "./Tile.module.scss";

type Props = {
  label: string;
  children: ReactNode;
};
const Tile = ({ children, label }: Props) => {
  return (
    <div className={styles.tile}>
      <Typography variant="h6" className={styles.label}>
        {label}
      </Typography>
      <Typography variant="h4" className={styles.value}>
        {children}
      </Typography>
    </div>
  );
};

export default Tile;
