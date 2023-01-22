module.exports = async (github, context, core, workflowId) => {
    const { data } = workflowId
        ? await github.rest.actions.listWorkflowRunArtifacts({
            owner: context.repo.owner,
            repo: context.repo.repo,
            run_id: Number(workflowId)
        }) : await github.rest.actions.listArtifactsForRepo({
            owner: context.repo.owner,
            repo: context.repo.repo
        })

    const artifacts = data.artifacts.filter(a => a.name === 'bundle-artifacts')

    if (artifacts.length === 0) {
        core.setFailed('No artifacts with name bundle-artifacts found')
        return
    }

    const artifact = artifacts[0]

    core.info(`Getting downloadUrl for artifact ID ${artifact.id}...`)

    // This returns a download URL. The URL expires after 1 minute.
    const generateDownloadUrl = await github.rest.actions.downloadArtifact({
        owner: context.repo.owner,
        repo: context.repo.repo,
        artifact_id: artifact.id,
        archive_format: 'zip'
    })

    const downloadUrl = generateDownloadUrl.url

    if (!downloadUrl) {
        core.setFailed(`Could not get download URL for artifact ${artifact.id}. Output: ${JSON.stringify(generateDownloadUrl)}`)
        return
    }

    core.info(`Successfully got downloadUrl. It expires after 1 minute: ${downloadUrl}`)
    core.setOutput('downloadUrl', downloadUrl)
}
