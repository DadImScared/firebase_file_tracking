import * as functions from 'firebase-functions';

interface IAllotmentData {
    files: [{ fileName: string }];
    person: {
        emailAddress: string,
        name: string
    };
}

export const allotments = functions.database.ref('/allotments/{allotmentId}')
    .onCreate(async (snapshot) => {
    const { files, person: { emailAddress, name }}: IAllotmentData = snapshot.val();
    if (!files || !files.length || !emailAddress || !name) {
        console.error(new Error('missing files or person information during allotment creation'));
        return;
    }
    const fileNames = [];
    const updatedFiles = {};
    files.forEach(({ fileName }) => {
        updatedFiles[`/${fileName}/status`] = 'Given';
        fileNames.push(fileName);
    });
    const newEmail = snapshot.ref.root.child('/emails').push();
    await snapshot.ref.root.child(`/files`).update(updatedFiles);
    return newEmail.set({
        body: `Hello, ${name} you have been given these files ${fileNames.join(', ')}`,
        recipient: emailAddress,
        subject: 'New files',
    });
});
