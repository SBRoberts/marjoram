import { html, useViewModel } from "../../../src";

export const JumpLink = ({
  text,
  target,
}: {
  text: string;
  target: Element;
}) => {
  const viewModel = useViewModel({ text });

  const view = html` <button ref="jumpLink">${viewModel.text}</button> `;

  const { jumpLink } = view.collect();

  jumpLink?.addEventListener("click", () =>
    target.scrollIntoView({ behavior: "smooth" })
  );

  view.viewModel = viewModel;

  return view;
};
