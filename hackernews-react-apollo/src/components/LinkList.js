import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';
import Link from './Link';

class LinkList extends Component {

    _updateCacheAfterVote = (store, createVote, linkId) => {
        // 1
        const data = store.readQuery({ query: ALL_LINKS_QUERY });

        // 2
        const voteLink = data.allLinks.find(link => link.id === linkId);
        voteLink.votes = createVote.link.votes;

        // 3
        store.writeQuery({ query: ALL_LINKS_QUERY, data });
    };

    _subscribeToNewLinks = () => {
        this.props.allLinksQuery.subscribeToMore({
            document: gql`
                subscription {
                    Link(filter: {
                        mutation_in: [CREATED]
                    }) {
                        node {
                            id
                            url
                            description
                            createdAt
                            postedBy {
                                id
                                name
                            }
                            votes {
                                id
                                user {
                                    id
                                }
                            }
                        }
                    }
                }
            `,
            updateQuery: (previous, { subscriptionData }) => {
                const newAllLinks = [
                    subscriptionData.link.node,
                    ...previous.allLinks
                ];
                const result = {
                    ...previous,
                    allLinks: newAllLinks
                };
                return result;
        }
        });
    };

    componentDidMount() {
        this._subscribeToNewLinks();
    }

    render () {
        if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
            return <div>Loading</div>
        }

        if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
            return <div>Error</div>
        }

        const linksToRender = this.props.allLinksQuery.allLinks;

        return (
            <div>
                {linksToRender.map((link, index) => (
                    <Link key={link.id}
                    updateStoreAfterVote={this._updateCacheAfterVote}
                          index={index}
                          link={link}
                    />
                ))}
            </div>
        )
    }
}

// 1
export const ALL_LINKS_QUERY = gql`
    # 2
    query AllLinksQuery {
        allLinks {
            id
            createdAt
            url
            description
            postedBy {
                id
                name
            }
            votes {
                id
                user {
                    id
                }
            }
        }    
    }
`;

// 3
export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' }) (LinkList);