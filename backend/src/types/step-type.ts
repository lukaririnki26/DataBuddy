/**
 * Step Type Enum
 *
 * Defines the available pipeline step types.
 */

export enum StepType {
  // Data Input/Output
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  READ_API = 'read_api',
  WRITE_API = 'write_api',

  // Data Transformation
  TRANSFORM_COLUMNS = 'transform_columns',
  FILTER_ROWS = 'filter_rows',
  SORT_DATA = 'sort_data',
  MERGE_DATASETS = 'merge_datasets',

  // Data Validation
  VALIDATE_SCHEMA = 'validate_schema',
  CHECK_DUPLICATES = 'check_duplicates',
  VALIDATE_RULES = 'validate_rules',

  // Data Export
  EXPORT_CSV = 'export_csv',
  EXPORT_EXCEL = 'export_excel',
  EXPORT_JSON = 'export_json',
  EXPORT_DATABASE = 'export_database',

  // Custom/Advanced
  CUSTOM_SCRIPT = 'custom_script',
}
