import React from 'react';
import { Button } from '../common/Button';

interface ResourceActionPanelProps {
  onAddResource: () => void;
  onEditResource: () => void;
  onDeleteResource: () => void;
  isResourceSelected: boolean;
}

export const ResourceActionPanel: React.FC<ResourceActionPanelProps> = ({
  onAddResource,
  onEditResource,
  onDeleteResource,
  isResourceSelected,
}) => {
  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Resource Actions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your emergency response resources.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="flex space-x-3">
            <Button onClick={onAddResource}>
              Add New Resource
            </Button>
            <Button
              variant="secondary"
              onClick={onEditResource}
              disabled={!isResourceSelected}
            >
              Edit Resource
            </Button>
            <Button
              variant="danger"
              onClick={onDeleteResource}
              disabled={!isResourceSelected}
            >
              Delete Resource
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
