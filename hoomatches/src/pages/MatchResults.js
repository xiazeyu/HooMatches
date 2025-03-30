import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function MatchResults() {
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username') || 'Guest';

    const [matchData, setMatchData] = useState(null);
    const [actionFeedback, setActionFeedback] = useState('');
    const [continueDisabled, setContinueDisabled] = useState(false);
    const [skipDisabled, setSkipDisabled] = useState(false);

    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                const requestOptions = {
                    method: 'GET',
                    redirect: 'follow'
                };

                const response = await fetch(`https://workers-hoomatches.kkmk.workers.dev/api/match?username=${username}`, requestOptions);
                const result = await response.json();

                if (!result.success) {
                    setMatchData({ success: false, reason: result.reason });
                } else {
                    setMatchData({ success: true, contact: result.contact });
                }
            } catch (error) {
                console.error('Error fetching match data:', error);
            }
        };

        fetchMatchData();
    }, [username]);

    const handleAction = async (action) => {
        if (action === 'continue') setContinueDisabled(true);
        if (action === 'skip') {
            setContinueDisabled(true);
            setSkipDisabled(true);
        }

        try {
            const raw = JSON.stringify({ username, action });
            const requestOptions = {
                method: 'POST',
                body: raw,
                redirect: 'follow'
            };

            const response = await fetch("https://workers-hoomatches.kkmk.workers.dev/api/match", requestOptions);
            const result = await response.json();

            if (result.success) {
                setActionFeedback(result.message);
            } else {
                setActionFeedback('Failed to process action');
            }
        } catch (error) {
            console.error('Error processing action:', error);
            setActionFeedback('Error processing action');
        }
    };

    if (!matchData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="results-container">
            <h2>Welcome, {username}!</h2>
            {matchData.success ? (
                <>
                    <h1 className="success">🎉 Match Found!</h1>
                    <p>Contact: {matchData.contact}</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button 
                            onClick={() => handleAction('continue')} 
                            disabled={continueDisabled} 
                            style={{ backgroundColor: continueDisabled ? 'gray' : '', cursor: continueDisabled ? 'not-allowed' : '' }}
                        >
                            Continue
                        </button>
                        <button 
                            onClick={() => handleAction('skip')} 
                            disabled={skipDisabled} 
                            style={{ backgroundColor: skipDisabled ? 'gray' : '', cursor: skipDisabled ? 'not-allowed' : '' }}
                        >
                            Skip
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h1 className="notice">🔍 No Match Found</h1>
                    <p>Reason: {matchData.reason}</p>
                </>
            )}
            {actionFeedback && <p className="feedback">{actionFeedback}</p>}
        </div>
    );
}