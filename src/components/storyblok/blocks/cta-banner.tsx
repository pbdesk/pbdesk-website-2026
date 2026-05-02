import CtaBannerComponent from "@/components/home/cta-banner";
import { editable } from "./editable";
import type { CtaBannerBlok } from "./types";

export default function CtaBanner({ blok }: { blok: CtaBannerBlok }) {
  return (
    <div {...editable(blok)}>
      <CtaBannerComponent
        description={blok.description}
        heading={blok.heading}
        placeholder={blok.placeholder}
        submitLabel={blok.submit_label}
      />
    </div>
  );
}
