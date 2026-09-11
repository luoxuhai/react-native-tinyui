// React Native's strict public API omits the internal modules used by Fabric codegen.
declare module 'react-native/Libraries/Types/CodegenTypes' {
  export type Double = number;
  export type Float = number;
  export type DirectEventHandler<T> = (event: { nativeEvent: T }) => void;
}
