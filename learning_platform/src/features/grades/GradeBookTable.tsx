import React, { useState, useMemo } from 'react';
import { formatDate } from '../../utils/formatters';
import { Grade } from '../../types';

export interface GradeBookTableProps {
  grades: Grade[];
  displayMode: 'student' | 'instructor';
}

type SortField = 'assignmentTitle' | 'grade' | 'submittedAt';
type SortDirection = 'asc' | 'desc';

export const GradeBookTable: React.FC<GradeBookTableProps> = ({
  grades,
  displayMode
}) => {
  const [sortField, setSortField] = useState<SortField>('assignmentTitle');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedGrades = useMemo(() => {
    return [...grades].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'assignmentTitle':
          aValue = a.assignmentTitle;
          bValue = b.assignmentTitle;
          break;
        case 'grade':
          aValue = a.grade;
          bValue = b.grade;
          break;
        case 'submittedAt':
          aValue = new Date(a.submittedAt);
          bValue = new Date(b.submittedAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [grades, sortField, sortDirection]);

  const averageGrade = useMemo(() => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return sum / grades.length;
  }, [grades]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  const getAriaSortValue = (field: SortField): 'ascending' | 'descending' | 'none' => {
    if (sortField !== field) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Grade Book
        </h3>
        {displayMode === 'instructor' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Class Average: {averageGrade.toFixed(1)}%
          </p>
        )}
      </div>

      {grades.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No grades available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {displayMode === 'instructor' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                )}
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('assignmentTitle')}
                  aria-sort={getAriaSortValue('assignmentTitle')}
                  role="columnheader"
                >
                  <div className="flex items-center space-x-1">
                    <span>Assignment</span>
                    {getSortIcon('assignmentTitle')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('grade')}
                  aria-sort={getAriaSortValue('grade')}
                  role="columnheader"
                >
                  <div className="flex items-center space-x-1">
                    <span>Grade</span>
                    {getSortIcon('grade')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('submittedAt')}
                  aria-sort={getAriaSortValue('submittedAt')}
                  role="columnheader"
                >
                  <div className="flex items-center space-x-1">
                    <span>Submitted</span>
                    {getSortIcon('submittedAt')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedGrades.map((grade, index) => (
                <tr
                  key={`${grade.assignmentId}-${grade.studentId}-${index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {displayMode === 'instructor' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {grade.studentName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {grade.assignmentTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span className={`font-semibold ${
                        grade.grade >= 90 ? 'text-green-600 dark:text-green-400' :
                        grade.grade >= 80 ? 'text-blue-600 dark:text-blue-400' :
                        grade.grade >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {grade.grade.toFixed(1)}%
                      </span>
                      {grade.maxGrade && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                          / {grade.maxGrade}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(grade.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      grade.status === 'graded' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : grade.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {grade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {displayMode === 'student' && grades.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Assignments: {grades.length}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              Your Average: {averageGrade.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
