/**
 * Step Type Enum
 *
 * Defines the available pipeline step types.
 */

export enum StepType {
  // Data Input/Output
  READ_FILE = "read_file",
  WRITE_FILE = "write_file",
  READ_API = "read_api",
  WRITE_API = "write_api",

  // Data Transformation
  TRANSFORM_COLUMNS = "transform_columns",
  FILTER_ROWS = "filter_rows",
  SORT_DATA = "sort_data",
  GROUP_DATA = "group_data",
  JOIN_DATASETS = "join_datasets",

  // Data Processing
  VALIDATE_DATA = "validate_data",
  CLEAN_DATA = "clean_data",
  REMOVE_DUPLICATES = "remove_duplicates",
  FILL_MISSING_VALUES = "fill_missing_values",

  // Data Analysis
  AGGREGATE_DATA = "aggregate_data",
  CALCULATE_METRICS = "calculate_metrics",

  // Advanced
  APPLY_FORMULA = "apply_formula",
  CUSTOM_SCRIPT = "custom_script",
  CONDITIONAL_BRANCH = "conditional_branch",
  LOOP_ITERATION = "loop_iteration",
}
