interface RawValidationError {
  property: string;
  constraints?: Record<string, string>;
  children?: RawValidationError[];
}

export interface FieldValidationError {
  field: string;
  message: string;
}

function collect(errors: RawValidationError[], parentPath: string): FieldValidationError[] {
  return errors.flatMap((error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    return [
      ...Object.values(error.constraints ?? {}).map((message) => ({ field: path, message })),
      ...collect(error.children ?? [], path),
    ];
  });
}

export function formatValidationErrors(errors: RawValidationError[]): FieldValidationError[] {
  return collect(errors, '');
}
