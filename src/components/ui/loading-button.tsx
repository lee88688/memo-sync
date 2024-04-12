import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (props, ref) => {
    const { children, loading = false, ...rest } = props;
    return (
      <Button ref={ref} {...rest} disabled={loading}>
        {loading && <LoaderCircle className={"w-4 h-4 mr-2"} />}
        {props.children}
      </Button>
    );
  },
);
LoadingButton.displayName = "LoadingButton";
