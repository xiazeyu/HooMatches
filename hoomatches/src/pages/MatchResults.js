import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MatchResults() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
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
                    setMatchData({ success: true, contact: result.contact, score: result.score });
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
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Matching<span className="dots">...</span></p>
                <style>
                    {`
                    .dots::after {
                        content: '';
                        display: inline-block;
                        animation: dots 1.5s steps(3, end) infinite;
                    }
                    @keyframes dots {
                        0% { content: ''; }
                        33% { content: '.'; }
                        66% { content: '..'; }
                        100% { content: '...'; }
                    }
                    `}
                </style>
            </div>
        );
    }

    return (
        <div className="results-container">
            <h2>Welcome, {username}!</h2>
            {matchData.success ? (
                <>
                    <h1 className="success">🎉 Match Found!</h1>
                    <p style={{ fontStyle: 'italic', marginTop: '10px' }}>
                        Take a moment to consider your next step. Making contact could lead to something wonderful!
                    </p>
                    <br />
                    <p>Contact: {matchData.contact}</p>
                    <p>Score: {matchData.score}</p>
                    <br />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button 
                            onClick={() => handleAction('continue')} 
                            disabled={continueDisabled} 
                            style={{ backgroundColor: continueDisabled ? 'gray' : '', cursor: continueDisabled ? 'not-allowed' : '' }}
                            title="Select 'Connect' to express mutual interest; if both reciprocate, you’ll exit the matching process."
                        >
                            Connect
                        </button>
                        <button 
                            onClick={() => handleAction('skip')} 
                            disabled={skipDisabled} 
                            style={{ backgroundColor: skipDisabled ? 'gray' : '', cursor: skipDisabled ? 'not-allowed' : '' }}
                            title="Choose 'Skip' to permanently pass on this person and move to the next match."
                        >
                            Skip
                        </button>
                    </div>
                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#555' }}>
                        <p><strong>Connect:</strong> Express mutual interest; if both reciprocate, you'll exit the matching process.</p>
                        <p><strong>Skip:</strong> Permanently pass on this person and move to the next match.</p>
                    </div>
                </>
            ) : (
                <>
                    <h1 className="notice">🔍 No Match Found</h1>
                    <p>Reason: {matchData.reason}</p>
                </>
            )}
            {actionFeedback && <p className="feedback">{actionFeedback}</p>}
            <button 
                onClick={() => navigate('/')} 
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Log out
            </button>
        </div>
    );
}