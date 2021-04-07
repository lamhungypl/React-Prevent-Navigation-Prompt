import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { Location, UnregisterCallback } from 'history';
import { useHistory } from 'react-router-dom';

interface Props {}

const usePrompt = (message, when: boolean) => {
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
};

const useNavigationPrompt = (when: boolean) => {
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
};

function NavigateModal({ blocking }: { blocking: boolean }) {
  const { showPrompt, confirmNavigation, cancelNavigation } = useNavigationPrompt(blocking);
  return (
    <>
      <Modal centered visible={showPrompt} onOk={confirmNavigation} onCancel={cancelNavigation}>
        Changes have been made Do you want to discard the changes and go back to previous page?
      </Modal>
    </>
  );
}
export { useNavigationPrompt, NavigateModal };
export default NavigateModal;
