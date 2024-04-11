import React from 'react';

interface TableProps {
  children: React.ReactNode;
}

const Table = ({ children }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">{children}</table>
    </div>
  );
};

interface TheadProps {
  children: React.ReactNode;
}

const Thead = ({ children }: TheadProps) => (
  <thead className="bg-gray-50">{children}</thead>
);

interface TbodyProps {
  children: React.ReactNode;
}

const Tbody = ({ children }: TbodyProps) => (
  <tbody>{children}</tbody>
);

interface TrProps {
  children: React.ReactNode;
}

const Tr = ({ children }: TrProps) => (
  <tr className="border-b">{children}</tr>
);

interface ThProps {
  children: React.ReactNode;
  sort?: boolean;
  onClick?: () => void;
}

const Th = ({ children, sort, onClick }: ThProps) => (
  <th
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sort ? 'hover:bg-gray-100' : ''}`}
    onClick={onClick}
  >
    {children}
  </th>
);

// Export composants
export { Table, Thead, Tbody, Tr, Th };
