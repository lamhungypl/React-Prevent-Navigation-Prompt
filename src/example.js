import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

import 'antd/dist/antd.css';
import NavigateModal from './modal';

// Sometimes you want to prevent the user from
// navigating away from a page. The most common
// use case is when they have entered some data
// into a form but haven't submitted it yet, and
// you don't want them to lose it.

export default function PreventingTransitionsExample() {
  return (
    <Router>
      <ul>
        <li>
          <Link to="/">Form</Link>
        </li>
        <li>
          <Link to="/one">One</Link>
        </li>
        <li>
          <Link to="/two">Two</Link>
        </li>
      </ul>

      <Switch>
        <Route path="/" exact children={<BlockingForm />} />
        <Route path="/one" children={<h3>One</h3>} />
        <Route path="/two" children={<h3>Two</h3>} />
      </Switch>
    </Router>
  );
}

function usePrompt(message, when) {
  const history = useHistory();
  const unblock = useRef(null);

  useEffect(() => {
    if (when) {
      unblock.current = history.block(message);
    } else {
      unblock.current = null;
    }
    return () => {
      if (unblock.current) {
        unblock.current();
      }
    };
  }, [when, history, message]);
}

function useCallbackPrompt(when) {
  const history = useHistory();
  const [showPrompt, setShowPrompt] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  const cancelNavigation = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const handleBlockedNavigation = useCallback(
    nextLocation => {
      if (!confirmedNavigation) {
        setShowPrompt(true);
        setLastLocation(nextLocation);
        return false;
      }
      return true;
    },
    [confirmedNavigation]
  );

  const confirmNavigation = useCallback(() => {
    setShowPrompt(false);
    setConfirmedNavigation(true);
  }, []);

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      history.push(lastLocation.pathname);
    }
  }, [confirmedNavigation, lastLocation]);

  usePrompt(handleBlockedNavigation, when);

  return { showPrompt, confirmNavigation, cancelNavigation };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function SavePrompt({ isBlocking, isSaving, onSave }) {
  const { showPrompt, confirmNavigation, cancelNavigation } = useCallbackPrompt(isBlocking);
  return (
    <Modal
      title="You have unsaved changes"
      visible={showPrompt}
      onOk={confirmNavigation}
      onCancel={cancelNavigation}
      closable={!isSaving}
      maskClosable={!isSaving}
      footer={[
        <Button key="cancel" disabled={isSaving} type="default" onClick={cancelNavigation}>
          Cancel
        </Button>,
        <Button key="discard" disabled={!isBlocking || isSaving} type="danger" onClick={confirmNavigation}>
          Discard changes & Exit
        </Button>,
        <Button
          key="save"
          disabled={!isBlocking || isSaving}
          type="primary"
          icon={isSaving ? <LogoutOutlined spin /> : null}
          onClick={() => {
            onSave().then(() => confirmNavigation());
          }}
        >
          {isSaving ? 'Saving changes' : 'Save changes & Exit'}
        </Button>,
      ]}
    >
      <p>What do you want to do?</p>
    </Modal>
  );
}

function BlockingForm() {
  const [isBlocking, setIsBlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const save = () => {
    setIsSaving(true);
    return sleep(100).then(() => {
      setIsSaving(false);
      setIsBlocking(false);
    });
  };

  return (
    <form>
      <p>Blocking?? {isBlocking ? 'Yes, you have unsaved changes. Try to navigate to a different page' : 'Nope'}</p>
      {/* <SavePrompt isBlocking={isBlocking} isSaving={isSaving} onSave={save} /> */}
      <NavigateModal blocking={isBlocking} />
      <p>
        <input
          size="50"
          placeholder="type something to block transitions"
          onChange={event => {
            setIsBlocking(true);
          }}
        />
      </p>

      <p>
        <Button onClick={save} icon={isSaving ? <LogoutOutlined spin /> : null} disabled={!isBlocking || isSaving}>
          {isSaving ? 'Saving changes' : 'Save changes'}
        </Button>
      </p>
    </form>
  );
}
