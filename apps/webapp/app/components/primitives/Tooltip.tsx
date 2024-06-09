import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "~/utils/cn";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

const variantClasses = {
  basic:
    "bg-background-dimmed border border-charcoal-700 rounded-md px-3 py-1.5 text-sm text-text-bright shadow-md fade-in-50",
  dark: "bg-background-dimmed border border-grid-bright rounded px-3 py-2 text-sm text-text-bright shadow-md fade-in-50",
};

type Variant = keyof typeof variantClasses;

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ ...props }, ref) => <TooltipPrimitive.Arrow className="fill-popover z-50" {...props} />);
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
>(({ delayDuration = 0, ...props }, ref) => (
  <TooltipPrimitive.Root delayDuration={delayDuration} {...props} />
));
Tooltip.displayName = TooltipPrimitive.Root.displayName;

const TooltipTrigger = TooltipPrimitive.Trigger;

type TooltipContentProps = {
  variant?: Variant;
} & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, variant = "basic", ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden animate-in data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
      variantClasses[variant],
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

function SimpleTooltip({
  button,
  content,
  side,
  hidden,
  variant,
  disableHoverableContent = false,
  className,
}: {
  button: React.ReactNode;
  content: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  hidden?: boolean;
  variant?: Variant;
  disableHoverableContent?: boolean;
  className?: string;
}) {
  return (
    <TooltipProvider disableHoverableContent={disableHoverableContent}>
      <Tooltip>
        <TooltipTrigger className="h-fit">{button}</TooltipTrigger>
        <TooltipContent
          side={side}
          hidden={hidden}
          className={cn("text-xs", className)}
          variant={variant}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function InfoIconTooltip({
  content,
  buttonClassName,
}: {
  content: React.ReactNode;
  buttonClassName?: string;
}) {
  return (
    <SimpleTooltip
      button={
        <InformationCircleIcon className={cn("h-3.5 w-3.5 text-text-dimmed", buttonClassName)} />
      }
      content={content}
      variant="dark"
    />
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SimpleTooltip };
