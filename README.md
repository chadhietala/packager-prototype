1. Take the first entry and copy it's dep-graph.json into the AllDependencies lookup table.
2. The graph is then passed to a flattening stage where the top level imports are discovered.
3. Enumerate over the imports syncing them forward to the output.
4. As we enumerate we lookup in AllDependencies if the import's root dep-graph.json has been copied into AllDependencies.
   - A) If not we recurse
   - B) We are done