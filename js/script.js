document.addEventListener("DOMContentLoaded", () => {

// Grab form element from page
const form = document.querySelector("#postcode")
const message = document.querySelector("#message")
const error = document.querySelector("#error")
const loading = document.querySelector("#loading")
const prompt = document.querySelector("#prompt")
const refresh = document.querySelector("#refresh")

function ShowMPInfo() {
  let result = document.getElementById("mpInfoBox");
  document.getElementById('graphicButton').style="display:block";
  result.style.display = "block";
  document.getElementById('mpInfoBox').scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
  loading.style.display = "none";
  form.style.display = "none";
  prompt.style.display = "none";
  refresh.style.display = "block";
}

function imageSrcToBase64(img) {
  const isBase64 = /^data:image\/(png|jpeg);base64,/.test(img.src);
  if (isBase64) {
    return;
  }
  return fetch(img)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        })
    )
    .then((dataURL) => {
      img.src = dataURL;
    });
}

function generateGraphic() {

  html2canvas(document.querySelector("#mpInfoBox"), {
    useCORS:true,
    proxy: 'https://mpreportcard.github.io/',
    windowWidth: mpInfoBox.width,
    width: mpInfoBox.width,
    windowHeight: mpInfoBox.height,
    height: mpInfoBox.height,

  }).then(canvas => {
      canvas.id = "graphic";
      document.getElementById('graphicOutput').appendChild(canvas);
      document.getElementById('graphic').style="display:none";
      document.getElementById('graphicButton').style="display:none";
      imgPreview = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      download_image();
  });

}

function download_image() {
  let download = document.getElementById("graphic");
  image = download.toDataURL("image/png").replace("image/png", "image/octet-stream");
  let link = document.createElement('a');
  link.download = "graphic.png";
  link.href = image;
  link.click();
}

let issuesFor = ['Voted for an emergency budget to tackle the cost of living crisis', 'Voted against Boris Johnson in a confidence vote', 'Voted to save jobs at P&O Ferries', 'Voted to ban fracking', 'Voted to remove VAT from energy bills']
let issuesAgainst = ['Voted against an emergency budget to tackle the cost of living crisis', 'Voted to have confidence in Boris Johnson', 'Voted against saving jobs at P&O Ferries', 'Voted to allow fracking', 'Voted against removing VAT from energy bills']
let issuesNeutralLab = ['Was absent for the vote on an emergency budget', 'Was absent for the confidence vote on Boris Johnson', 'Was absent from the vote on P&O Ferries jobs', 'Was absent for the vote on fracking', 'Was absent for the vote on removing VAT from energy bills']
let issuesNeutralCon = ['Did not vote for an emergency budget to tackle the cost of living crisis', 'Did not vote to remove Boris Johnson from office', 'Did not vote to save jobs at P&O Ferries', 'Did not vote to ban fracking', 'Did not vote remove VAT from energy bills']
let forImage = ['img/A.png', 'img/A.png', 'img/A.png', 'img/A.png', 'img/A.png'];
let againstImage = ['img/F.png', 'img/F.png', 'img/F.png', 'img/F.png', 'img/F.png'];
//Sewage, Energy VAT, P&O Ferries, Fracking,
let voteCodes = [1308, 1351, 1253, 1372, 1191]

let constituency
let constituencyString
let mpFirstName
let mpLastName
let mpFirstNameRaw
let mpLastNameRaw
let vote
let voteString
let accused
let party
let partyString
let note
let mpPhoto
let mpID

form.addEventListener("submit", e => {
  // Stop page refreshing
  e.preventDefault()
  // Make form data accessible as JS variable

  let formData = new FormData(form)
  let postcode = formData.get("postcode")

  function printMessageToScreen(constituencyString){
  fetch(`https://mpreportcard.github.io/MPReportCard/js/constituencies.json`)
      .then(res => res.json())
      .then(data => {
      if(constituencyString == undefined) {
        error.style.display = "block";
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
      } else if (constituencyString == "West Lancashire") {
        error.style.display = "block";
        error.innerHTML = `Your constituency, ${constituencyString}, does not currently have an MP until an upcoming by-election.`;
      } else if (constituencyString == "Stretford and Urmston") {
        error.style.display = "block";
        error.innerHTML = `Your MP in ${constituencyString}, Andrew Western, is newly elected and so has no voting record on these issues.`;
      } else if (constituencyString == "City of Chester") {
        error.style.display = "block";
        error.innerHTML = `Your MP in ${constituencyString}, Samantha Dixon, is newly elected and so has no voting record on these issues.`;
      } else {
        loading.style.display = "block";
        error.style.display = "none"
        mpFirstNameRaw = data[constituencyString].Firstname
        mpFirstName = mpFirstNameRaw.toString()
        mpLastNameRaw = data[constituencyString].Lastname
        mpLastName = mpLastNameRaw.toString()
        mpFullName = mpFirstName + " " + mpLastName
        accused = data[constituencyString].Accused
        noteRaw = data[constituencyString].Note
        note = noteRaw.toString();

      fetch(`https://members-api.parliament.uk/api/Members/Search?Name=${mpFirstName}%20${mpLastName}&skip=0&take=20`)
          .then(res => res.json())
          .then(parlData => {
            //console.log(parlData)

            mpPhoto = parlData.items[0].value.thumbnailUrl;
            imageSrcToBase64(mpPhoto);
            party = parlData.items[0].value.latestParty.name;
            mpID = parlData.items[0].value.id;
            console.log(mpID);

            document.getElementById('mpPhoto').src = `${mpPhoto}`

            switch (party) {
                case "Labour (Co-op)":
                  partyString = "Labour and Co-operative";
                  break;
                default:
                  partyString = party;
            }

            mpNameBullet.innerHTML = `${mpFirstName} ${mpLastName}`;
            partyBullet.innerHTML = `${partyString}`;
            constituencyBullet.innerHTML = `${constituencyString}`;

function checkVote(code, constituencyString) {
  fetch(`https://commonsvotes-api.parliament.uk/data/division/${voteCodes[code]}.json`)
      .then(res => res.json())
      .then(voteData => {

        console.log(voteData);

          let ayesArray = voteData.Ayes;
          let ayeTellersArray = voteData.AyeTellers;
          let noesArray = voteData.Noes;
          let noTellersArray = voteData.NoTellers;

          if (partyString == "Conservative") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralCon[code]}: `;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/F.png" width = 48px title="Absent or Abstained"/>`;
          } else if (partyString == "Labour") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = `An MP may have been absent for several reasons - e.g., away on Parliamentary business, ill, or acting as a teller.`;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          } else if (partyString == "Labour and Co-operative") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = `An MP may have been absent for several reasons - e.g., away on Parliamentary business, ill, or acting as a teller.`;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          } else {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = `An MP may have been absent for several reasons - e.g., away on Parliamentary business, ill, or acting as a teller.`;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          }

          for (let k = 0; k < ayeTellersArray.length; k++) {
            if (ayeTellersArray[k].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesFor[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${forImage[code]}" width = 48px title="For"/>`;
              console.log(`voteOutcome${code}: Aye`);
              break;
            }
          }

          for (let l = 0; l < ayesArray.length; l++) {
            if (ayesArray[l].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesFor[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${forImage[code]}" width = 48px title="For"/>`;
              console.log(`voteOutcome${code}: Aye`);
              break;
            }
          }

          for (let m = 0; m < noTellersArray.length; m++) {
            if (noTellersArray[m].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesAgainst[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${againstImage[code]}" width = 48px title="Against"/>`;
              console.log(`voteOutcome${code}: No`);
              break;
            }
          }

          for (let n = 0; n < noesArray.length; n++) {
            if (noesArray[n].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesAgainst[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${againstImage[code]}" width = 48px title="Against"/>`;
              console.log(`voteOutcome${code}: No`);
              break;
            }
          }
        }
  }
  )
}

checkVote(0, constituencyString);
checkVote(1, constituencyString);
checkVote(2, constituencyString);
checkVote(3, constituencyString);
checkVote(4, constituencyString);

if (constituencyString == "Birmingham Edgbaston") {
  document.getElementById(`issue1Name`).innerHTML = `Voted for an emergency budget to tackle the cost of living crisis.`;
  document.getElementById(`absenceDisclaimer1`).innerHTML = ``;
  document.getElementById(`voteOutcome1`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue2Name`).innerHTML = `Voted against Boris Johnson in a confidence vote.`;
  document.getElementById(`absenceDisclaimer2`).innerHTML = ``;
  document.getElementById(`voteOutcome2`).innerHTML = `<img src="img/A.png" width = 48px title="Against"/>`;
  document.getElementById(`issue3Name`).innerHTML = `Voted to end non-dom tax status.`;
  document.getElementById(`absenceDisclaimer3`).innerHTML = ``;
  document.getElementById(`voteOutcome3`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue4Name`).innerHTML = `Voted to ban fracking.`;
  document.getElementById(`absenceDisclaimer4`).innerHTML = ``;
  document.getElementById(`voteOutcome4`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue5Name`).innerHTML = `Voted to remove VAT from energy bills.`;
  document.getElementById(`absenceDisclaimer5`).innerHTML = ``;
  document.getElementById(`voteOutcome5`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
} else if (constituencyString == "Mitcham and Morden") {

} else if (constituencyString == "Alyn and Deeside") {
  document.getElementById(`issue1Name`).innerHTML = `Voted for an emergency budget to tackle the cost of living crisis.`;
  document.getElementById(`absenceDisclaimer1`).innerHTML = ``;
  document.getElementById(`voteOutcome1`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue2Name`).innerHTML = `Voted against a tax cut for bankers.`;
  document.getElementById(`absenceDisclaimer2`).innerHTML = ``;
  document.getElementById(`voteOutcome2`).innerHTML = `<img src="img/A.png" width = 48px title="Against"/>`;
  document.getElementById(`issue3Name`).innerHTML = `Was a teller on the vote to save jobs at P&O Ferries.`;
  document.getElementById(`absenceDisclaimer3`).innerHTML = ``;
  document.getElementById(`voteOutcome3`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue4Name`).innerHTML = `Voted to ban fracking.`;
  document.getElementById(`absenceDisclaimer4`).innerHTML = ``;
  document.getElementById(`voteOutcome4`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue5Name`).innerHTML = `Voted to remove VAT from energy bills.`;
  document.getElementById(`absenceDisclaimer5`).innerHTML = ``;
  document.getElementById(`voteOutcome5`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
} else if (constituencyString == "Nottingham South") {
  document.getElementById(`issue1Name`).innerHTML = `Voted for an emergency budget to tackle the cost of living crisis.`;
  document.getElementById(`absenceDisclaimer1`).innerHTML = ``;
  document.getElementById(`voteOutcome1`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue2Name`).innerHTML = `Voted against a tax cut for bankers.`;
  document.getElementById(`absenceDisclaimer2`).innerHTML = ``;
  document.getElementById(`voteOutcome2`).innerHTML = `<img src="img/A.png" width = 48px title="Against"/>`;
  document.getElementById(`issue3Name`).innerHTML = `Was a teller on the vote to save jobs at P&O Ferries.`;
  document.getElementById(`absenceDisclaimer3`).innerHTML = ``;
  document.getElementById(`voteOutcome3`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue4Name`).innerHTML = `Voted to ban fracking.`;
  document.getElementById(`absenceDisclaimer4`).innerHTML = ``;
  document.getElementById(`voteOutcome4`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
  document.getElementById(`issue5Name`).innerHTML = `Voted to remove VAT from energy bills.`;
  document.getElementById(`absenceDisclaimer5`).innerHTML = ``;
  document.getElementById(`voteOutcome5`).innerHTML = `<img src="img/A.png" width = 48px title="For"/>`;
}

let graphicButton = document.getElementById('graphicButton');
graphicButton.addEventListener("click", generateGraphic);

ShowMPInfo();

twtLink.setAttribute("href", `#`)
fbLink.setAttribute("href", `#`)
waLink.setAttribute("href", `#`)
socials.style = "display: block;"
          })

  }
                      }
            )
  }

function getConstituencyName(postcode) {
  fetch(`https://api.postcodes.io/postcodes/${postcode}`)
    .then(res => res.json())
    .then(data => {
      if(data.status != 200) {
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
        error.style.display = "block";
      } else {
      let constituency = data.result.parliamentary_constituency
      let constituencyString = constituency.toString()
      printMessageToScreen(constituencyString)
      }
    }
    )
}

getConstituencyName(postcode);

})

})
