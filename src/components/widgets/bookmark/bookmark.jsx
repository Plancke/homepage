import Container from "../widget/container";
import Raw from "../widget/raw";

import ResolvedIcon from "components/resolvedicon";

export default function Bookmark({ options }) {
  return (
    <Container options={options} additionalClassNames="information-widget-bookmark">
      <Raw>
        <a
          href={options.href}
          title={options.title}
          target={options.target ?? "_blank"}
        >
          <div className="flex flex-row self-center items-center">
            {options.icon && (
              <ResolvedIcon icon={options.icon} alt={options.abbr} />
            )}
            {options.text && (
              <span className={`text-theme-800 dark:text-theme-200 ml-3 text-${options.text_size || "sm"}`}>
                {options.text}
              </span>
            )}
          </div>
        </a>
      </Raw>
    </Container>
  );
}