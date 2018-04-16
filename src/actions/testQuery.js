import contract from 'truffle-contract';

export function testQuery(
  { web3, querySpecs }, 
  { QueryTest }
) {
  const type = 'TEST_QUERY';

  return function(dispatch) {
    dispatch({ type: `${type}_PENDING` });
    // Double-check web3's status
    //if (web3 && typeof web3 !== 'undefined') {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined' && web3.currentProvider && web3.currentProvider.isMetaMask) {
      // Using truffle-contract create needed contract objects and set providers
      const queryTest = contract(QueryTest);
      queryTest.setProvider(web3.currentProvider);

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        if (error) {
          console.error(error);
          return dispatch({ type: `${type}_REJECTED`, payload: error });
        }

        console.log('Attempting to submit test query from ' + coinbase);
        let queryTestContractInstance;

        queryTest
          .deployed()
          .then(function(queryTestContract) {
            queryTestContractInstance = queryTestContract;
            return queryTestContractInstance.testOracleQuery(
              querySpecs.oracleDataSource,
              querySpecs.oracleQuery,
              {
                gas: 200000,
                gasPrice: web3.toWei(1, 'gwei'),
                from: coinbase,
                value: web3.toWei('.006', 'ether')
              }
            );
          })
          .then(function(queryTransactionResults) {
            dispatch({ type: `${type}_TRANSACTION_PENDING`, payload: queryTransactionResults.tx });
            let queryEventIds = queryTransactionResults.logs
              .filter(({ event }) => event === 'QueryScheduled')
              .map(log => log.args.queryIDScheduled);

            if (queryEventIds.length === 0) {
              return dispatch({ type: `${type}_REJECTED`, payload: 'Could not find `QueryScheduled` event.' });
            }
            const queryID = queryEventIds[0];

            // Listen for query completed
            queryTestContractInstance.QueryCompleted()
              .watch(function(error, result) {
                if (result.args.queryIDCompleted === queryID) {
                  console.log('attempting to retrieve results for ' + queryID);
                  queryTestContractInstance.getQueryResults.call(queryID)
                    .then(function(queryResults) {
                      dispatch({ type: `${type}_FULFILLED`, payload: queryResults });
                    })
                    .catch(err => {
                      dispatch({ type: `${type}_REJECTED`, payload: err.message.split('\n')[0] });
                    });
                }
              });
          })
          .catch(err => {
            // catch errors during query submission
            return dispatch({ type: `${type}_REJECTED`, payload: err.message.split('\n')[0] });
          });
      });
    } else {
      dispatch({ type: `${type}_REJECTED`, payload: 'Web3 not initialised' });
    }
  };
}
