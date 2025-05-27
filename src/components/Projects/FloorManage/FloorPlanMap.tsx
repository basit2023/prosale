"use client"
import React from 'react';
import { useManageUnits } from './managefloor';
import { useSession } from 'next-auth/react';
import styles from './FloorPlanMap.module.css';
import { useRouter } from "next/navigation";

interface UnitProps {
  unit: any;
  onClick: (unit: any) => void;
}

const Unit: React.FC<UnitProps> = ({ unit, onClick }) => {
  const getStatusColor = () => {
    switch (unit.status.toLowerCase()) {
      case 'sold':
        return 'bg-red-500 border-red-700'; // Red for sold
      case 'hold':
        return 'bg-orange-500 border-orange-700'; // Orange for hold
      case 'available':
        return 'bg-green-500 border-green-700'; // Green for available
      default:
        return 'bg-gray-300 border-gray-500'; // Gray for other statuses
    }
  };

  return (
    <div
      className={`${styles.shopUnit} ${getStatusColor()} border-2 text-white p-2 rounded cursor-pointer hover:opacity-90 transition-all`}
      onClick={() => onClick(unit)}
      title={`${unit.Unit} - ${unit.Type} (${unit.status})`}
    >
      <div className="text-xs font-bold">{unit.Unit}</div>
      <div className="text-xs">{unit.Size}</div>
      <div className="text-xs">{unit.SqFtRate} SFT</div>
    </div>
  );
};

interface FloorPlanMapProps {
  id: string;
  slug: string;
  onUnitClick?: (unit: any) => void;
}

const FloorPlanMap: React.FC<FloorPlanMapProps> = ({slug, id, onUnitClick}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const units = useManageUnits(slug, id);

  const handleUnitClick = (unit: any) => {
    if (onUnitClick) {
      onUnitClick(unit);
    } else {
      router.push(`/units/${unit.id}`);
    }
  };

  // Sort units by their number (assuming unit.Unit contains the number)
  const sortedUnits = [...units].sort((a, b) => parseInt(a.Unit) - parseInt(b.Unit));

  // Create left and right side units for the passage
  const leftSideUnits = sortedUnits.filter((_, index) => index % 2 === 0);
  const rightSideUnits = sortedUnits.filter((_, index) => index % 2 !== 0);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Floor Plan Units</h2>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-1 rounded-full"></div>
            <span className="text-xs">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-1 rounded-full"></div>
            <span className="text-xs">Sold</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 mr-1 rounded-full"></div>
            <span className="text-xs">Hold</span>
          </div>
        </div>
      </div>

      {/* Floor Plan Visualization */}
      <div className={styles.floorPlanVisualization}>
        {/* Left side shops */}
        <div className={styles.shopColumn}>
          {leftSideUnits.map((unit) => (
            <Unit key={unit.id} unit={unit} onClick={handleUnitClick} />
          ))}
        </div>

        {/* Passage */}
        <div className={styles.passage}>
          <div className={styles.passageLabel}>10&#39;-0&#34; WIDE PASSAGE</div>
        </div>

        {/* Right side shops */}
        <div className={styles.shopColumn}>
          {rightSideUnits.map((unit) => (
            <Unit key={unit.id} unit={unit} onClick={handleUnitClick} />
          ))}
        </div>
      </div>

      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-sm">Total Units</h3>
          <p className="text-2xl">{units.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-sm">Available</h3>
          <p className="text-2xl text-green-600">
            {units.filter(u => u.status.toLowerCase() === 'available').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-sm">Sold</h3>
          <p className="text-2xl text-red-600">
            {units.filter(u => u.status.toLowerCase() === 'sold').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-sm">On Hold</h3>
          <p className="text-2xl text-orange-600">
            {units.filter(u => u.status.toLowerCase() === 'hold').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanMap;