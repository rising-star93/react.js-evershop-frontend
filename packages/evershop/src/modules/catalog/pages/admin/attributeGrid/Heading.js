import React from 'react';
import PageHeading from '../../../../cms/components/admin/PageHeading';

export default function Heading() {
  return <PageHeading backUrl={null} heading="Attributes" />;
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
