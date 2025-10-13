while getopts k:h:s: flag
do
    case "${flag}" in
        k) key=${OPTARG};;
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    printf "\nMissing required parameter.\n"
    printf "  syntax: deployReact.sh -k <pem key file> -h <hostname> -s <service>\n\n"
    exit 1
fi

printf "\n----> Deploying React bundle $service to $hostname with $key\n"

# Step 1
printf "\n----> Build the distribution package\n"
rm -rf build
mkdir build
npm install 
npm run build
cp -rf dist/* build 

# Step 2
printf "\n----> Clearing out previous distribution on the target\n"
ssh -i "~/Desktop/Important/pairing66.pem" ubuntu@NDGE.click << ENDSSH
rm -rf services/${startup}/public
mkdir -p services/${startup}/public
ENDSSH

# Step 3
printf "\n----> Copy the distribution package to the target\n"
scp -r -i "~/Desktop/Important/pairing66.pem" build/* ubuntu@NDGE.click:services/$startup/public

# Step 5
printf "\n----> Removing local copy of the distribution package\n"
rm -rf build
rm -rf dist

#  ./deployReact.sh -k ~/Desktop/Important/pairing66.pem -h ndge.click -s startup