import React, {Component} from 'react'
import LoadContractsButtonContainer from '../../ui/loadcontractsbutton/LoadContractsButtonContainer'

class Explorer extends Component {
  render() {
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <br></br>
            <br></br>
            <img
              src="https://camo.githubusercontent.com/8365043ef61ff2ffba307c1447fed64c9acc7fd1/68747470733a2f2f696d6167652e6962622e636f2f6e414e6379522f6c6f676f5f4d41524b45545f62616e6e65725f322e706e67"
              role="presentation"/>
            {/*learn how to make the above use a local file? */}
            <h1>Explore deployed MARKET Contracts</h1>
            <p>Loads deployed and whitelisted contracts from the blockchain</p>
            <LoadContractsButtonContainer/>
          </div>
        </div>
      </main>
    )
  }
}

export default Explorer