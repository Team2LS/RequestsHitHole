import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom'
import requestService from '../services/requestService';
import { Button, Stack, Container, ButtonGroup } from 'react-bootstrap';
import WebhookInfo from '../components/WebhookInfo';
import Request from '../components/Request';
import localBins from '../services/sessionPersistence'

type JSONPrimitive = string | number | boolean | JSONObject | null | undefined;
type JSONObject = { [key: string]: JSONPrimitive } | JSONObject[];

const NoBin = ({ setBinId }) => {
  const navigate = useNavigate();

  const createNewBin = () => {
    requestService
      .getNewBin()
      .then(data => {
        setBinId(data);
        localBins.saveBinId(data);
        navigate(`/${String(data)}`);
      })
  }

  return (
    <>
      <div className="float-end"><Button onClick={() => createNewBin(setBinId)}>New Hole</Button></div>
      <br></br>
      <p>Create a bin to get started</p>
    </>
  )
}

const SpecifiedBin = ({ webhooks, setWebhooks, requestDetail, setRequestDetail, setBinId, binId}) => {
  const newBinId = useParams().binId;
  const [reqInfo, setReqInfo] = useState(null);

  useEffect(() => {
    setBinId(newBinId);

    if (newBinId) {
      requestService
        .getRequestsByBinId(newBinId)
        .then(setWebhooks)
    }
  }, []);

  const refreshList = (setWebhooks, binId) => {
    requestService
      .getRequestsByBinId(binId)
      .then(setWebhooks)
  }

  const handleRequestInfoClick = (webhook): void => {
    requestService
      .getPayloadByMongoId(webhook["mongo_id"])
      .then(setRequestDetail)
      .then(() => setReqInfo(webhook))
  };

  return (
    <>
      <BinNav binId={binId} setWebhooks={setWebhooks} refreshList={refreshList}/>
      <Stack className="overflow-auto" direction='horizontal'>
        <RequestNav webhooks={webhooks} handleRequestInfoClick={handleRequestInfoClick}/>
        <Request reqInfo={reqInfo} reqPayload={requestDetail}/>
      </Stack>
    </>
  )
}

const RequestNav = ({ webhooks, handleRequestInfoClick }) => {
  return (
    <div className="btn-group-vertical float-left">
      <ButtonGroup vertical>
        {webhooks.map(webhook =>
          <Button key={webhook['id']} type="button" className="btn btn-outline-dark" onClick={() => handleRequestInfoClick(webhook)}>
            <WebhookInfo request_method={webhook["http_method"]} http_path={webhook["http_path"]}/>
          </Button>
        )}
      </ButtonGroup>
    </div>
  )
}

const Header = () => {
  return (
    <Stack direction='horizontal' style={{background: 'purple', color: 'white', padding: 5}}>
      <p>Requests Hit Hole</p>
    </Stack>
  )
}

const BinNav = ({ binId, refreshList, setWebhooks }) => {
  return (
    <Stack direction='horizontal' style={{background: 'chartreuse'}}>
      <h2>Your endpoint is {`https://${binId}.x.requestshithole.com`}</h2>
      <Button className='ms-auto' onClick={() => refreshList(setWebhooks, binId)}>Refresh List</Button>
    </Stack>
  )
}

const App = () => {
  const [allBins, setAllBins] = useState(localBins.getSavedBinIds());
  const [binId, setBinId] = useState("");
  const [webhooks, setWebhooks] = useState([]);
  const [requestDetail, setRequestDetail] = useState("");

  return (
    <div style={{padding: 0, height: '100vh', width: '100vw', position: 'fixed'}}>
      <Stack style={{padding: 0, height: '100%'}}>
        <Header />
        <Router>
          <Routes>
            {/* { (allBins.length > 0) && // TODO, this is a route for the baseURL but while there are local bins saved
              <Route path='/' element={<SpecifiedBin webhooks={webhooks} setWebhooks={setWebhooks} requestDetail = {requestDetail} setRequestDetail = {setRequestDetail} setBinId={setBinId} binId={binId}/>} />
            } */}
            <Route path='/' element={<NoBin setBinId={setBinId}/>} />
            <Route path='/:binId' element={<SpecifiedBin webhooks={webhooks} setWebhooks={setWebhooks} requestDetail = {requestDetail} setRequestDetail = {setRequestDetail} setBinId={setBinId} binId={binId}/>} />
          </Routes>
        </Router>
      </Stack>
    </div>
  )
}

export default App;
