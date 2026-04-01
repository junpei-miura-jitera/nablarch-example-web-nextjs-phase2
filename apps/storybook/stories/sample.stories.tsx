import type { Meta, StoryObj } from "@storybook/react";

function SampleButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button className="btn btn-primary" onClick={onClick}>
      {label}
    </button>
  );
}

const meta: Meta<typeof SampleButton> = {
  title: "Example/SampleButton",
  component: SampleButton,
};

export default meta;
type Story = StoryObj<typeof SampleButton>;

export const Primary: Story = {
  args: {
    label: "ボタン",
  },
};
