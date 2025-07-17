// ArrayBufferからUint8Arrayを作成するヘルパー関数
function createArrayBuffer(data) {
    const buffer = new ArrayBuffer(data.length);
    const view = new Uint8Array(buffer);
    data.forEach((byte, index) => {
        view[index] = byte;
    });
    return buffer;
}

// パスキー作成の設定
const passkeyConfig = {
    mediation: "conditional",
    publicKey: {
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            residentKey: "required"
        },
        challenge: createArrayBuffer([
            184, 191, 139, 132, 97, 131, 225, 90, 127, 84, 223, 104, 157, 62, 48, 208,
            93, 18, 138, 44, 102, 197, 199, 98, 208, 44, 184, 147, 111, 23, 121, 90
        ]),
        excludeCredentials: [],
        extensions: {},
        pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -37, type: "public-key" },
            { alg: -257, type: "public-key" }
        ],
        rp: {
            id: "inabajunmr.github.io",
            name: "パスキーデモサイト"
        },
        timeout: 120000,
        user: {
            displayName: "demo@example.com",
            id: createArrayBuffer([
                146, 24, 66, 116, 193, 212, 110, 157, 126, 195, 141, 148, 162, 108, 201, 87,
                37, 34, 159, 121, 17, 164, 54, 81, 18, 201, 139, 60, 181, 118, 68, 244,
                197, 43, 127, 231, 121, 229, 54, 148, 9, 234, 161, 61, 112, 249, 163, 254,
                146, 5, 42, 27, 205, 243, 254, 111, 46, 135, 251, 215, 134, 248, 58, 237
            ]),
            name: "demo@example.com"
        }
    }
};

// ステータス表示を更新する関数
function updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
    }
}

// パスキー作成処理
async function createPasskey() {
    try {
        updateStatus('パスキーの作成を開始しています...', 'info');
        
        // WebAuthn APIの対応確認
        if (!navigator.credentials) {
            throw new Error('このブラウザはWebAuthnをサポートしていません');
        }
        
        console.log('パスキー作成設定:', passkeyConfig);
        
        // パスキーの作成
        const credential = await navigator.credentials.create(passkeyConfig);
        
        if (credential) {
            updateStatus('パスキーが正常に作成されました！', 'success');
            console.log('作成されたパスキー:', credential);
            
            // 作成されたパスキーの詳細を表示
            const details = document.querySelector('.details');
            if (details) {
                details.innerHTML = `
                    <h3>パスキー作成完了</h3>
                    <p>• Credential ID: ${credential.id}</p>
                    <p>• Type: ${credential.type}</p>
                    <p>• Response Type: ${credential.response.constructor.name}</p>
                    <p>• Attestation Object Size: ${credential.response.attestationObject.byteLength} bytes</p>
                    <p>• Client Data JSON Size: ${credential.response.clientDataJSON.byteLength} bytes</p>
                `;
            }
        } else {
            throw new Error('パスキーの作成がキャンセルされました');
        }
        
    } catch (error) {
        console.error('パスキー作成エラー:', error);
        
        let errorMessage = 'パスキーの作成に失敗しました: ';
        
        if (error.name === 'NotAllowedError') {
            errorMessage += 'ユーザーによってキャンセルされました';
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'この機能はサポートされていません';
        } else if (error.name === 'SecurityError') {
            errorMessage += 'セキュリティエラーが発生しました';
        } else if (error.name === 'AbortError') {
            errorMessage += '操作がタイムアウトしました';
        } else {
            errorMessage += error.message;
        }
        
        updateStatus(errorMessage, 'error');
    }
}

// ページ読み込み時にパスキー作成を開始
document.addEventListener('DOMContentLoaded', function() {
    // 少し遅延を入れてから実行
    setTimeout(createPasskey, 100);
});