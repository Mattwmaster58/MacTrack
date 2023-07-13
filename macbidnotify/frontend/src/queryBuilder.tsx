import type {JsonGroup, Config, ImmutableTree, BuilderProps} from '@react-awesome-query-builder/mui'; // for TS example
import {Query, Builder, Utils as QbUtils} from '@react-awesome-query-builder/mui';
import {MuiConfig} from '@react-awesome-query-builder/mui';
import '@react-awesome-query-builder/mui/css/styles.css';
import React from 'react';

// You need to provide your own config. See below 'Config format'
const config: Config = {
    ...MuiConfig,
    fields: {
        terms: {
            label: "Search Terms",
            type: "string",
            fieldSettings: {
                min: 0
            },
            valueSources: ["value"],
            preferWidgets: ["number"]
        }
    }
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = {id: QbUtils.uuid(), type: "group"};

const DemoQueryBuilder: React.FC = () => {
    const [state, setState] = React.useState({
        tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
        config: config
    });

    const onChange = React.useCallback((immutableTree: ImmutableTree, config: Config) => {
        // Tip: for better performance you can apply `throttle` - see `examples/demo`
        setState(prevState => ({...prevState, tree: immutableTree, config: config}));

        const jsonTree = QbUtils.getTree(immutableTree);
        console.log(jsonTree);
        // `jsonTree` can be saved to backend, and later loaded to `queryValue`
    }, []);

    const renderBuilder = React.useCallback((props: BuilderProps) => (
        <div className="query-builder-container" style={{padding: "10px"}}>
            <div className="query-builder qb-lite">
                <Builder {...props} />
            </div>
        </div>
    ), []);

    return (
        <div>
            <Query
                {...config}
                value={state.tree}
                onChange={onChange}
                renderBuilder={renderBuilder}
            />
            <div className="query-builder-result">
                <div>
                    Query string:{" "}
                    <pre>
            {JSON.stringify(QbUtils.queryString(state.tree, state.config))}
          </pre>
                </div>
                <div>
                    MongoDb query:{" "}
                    <pre>
            {JSON.stringify(QbUtils.mongodbFormat(state.tree, state.config))}
          </pre>
                </div>
                <div>
                    SQL where:{" "}
                    <pre>
            {JSON.stringify(QbUtils.sqlFormat(state.tree, state.config))}
          </pre>
                </div>
                <div>
                    JsonLogic:{" "}
                    <pre>
            {JSON.stringify(QbUtils.jsonLogicFormat(state.tree, state.config))}
          </pre>
                </div>
            </div>
        </div>
    );
};
export default DemoQueryBuilder;