import { Fragment } from 'react';
import type { WorkflowStop } from '@/data';

/* Render a stop's copy, underlining the optional emphasis word (first match)
   with the stop accent. Avoids dangerouslySetInnerHTML. Shared across every
   workflow renderer; the caller passes its own module's `em` class so the
   highlight matches that variant's stylesheet. */
export function renderCopy(stop: WorkflowStop, emClass: string) {
  const { copy, emphasis } = stop;
  if (!emphasis) return copy;
  const at = copy.indexOf(emphasis);
  if (at < 0) return copy;
  return (
    <Fragment>
      {copy.slice(0, at)}
      <em className={emClass}>{emphasis}</em>
      {copy.slice(at + emphasis.length)}
    </Fragment>
  );
}
