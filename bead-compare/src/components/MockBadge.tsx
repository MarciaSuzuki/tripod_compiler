import type { Tape } from "../model";

/**
 * Small badge shown wherever a mock tape is displayed. The label is
 * translated by the screen (t("common.mock.badge")) so this component holds
 * no strings.
 */
export function MockBadge(props: { tape: Pick<Tape, "mock">; label: string }): JSX.Element | null {
  if (!props.tape.mock) return null;
  return (
    <span className="mock-badge" title={props.label}>
      {props.label}
    </span>
  );
}
