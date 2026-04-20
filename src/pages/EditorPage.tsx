import { EditorLayout } from '~/components/editor/EditorLayout';
import { ErrorBoundary } from '~/components/editor/ErrorBoundary';

export function EditorPage() {
  return (
    <ErrorBoundary>
      <EditorLayout />
    </ErrorBoundary>
  );
}
