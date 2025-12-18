import React, {type ReactNode} from 'react';
import OriginalDocItemLayout from '@theme-original/DocItem/Layout';
import type {Props} from '@theme/DocItem/Layout';
import GiscusComments from '@site/src/components/GiscusComments';

export default function DocItemLayout(props: Props): ReactNode {
  return (
    <>
      <OriginalDocItemLayout {...props} />
      <GiscusComments />
    </>
  );
}
