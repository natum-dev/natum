import Typography from "@natum/natum-ui/Typography";
import TypeContent from "./components/TypeContent";

export const metadata = {
  title: "Typo-Meter - Rev Your Fingers! ⌨️💨",
};

const Page = () => {
  return (
    <>
      <Typography variant="h3">Typo-Meter</Typography>
      <TypeContent />
    </>
  );
};

export default Page;
